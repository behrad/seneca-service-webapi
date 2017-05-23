import jwt from 'jsonwebtoken';

export const create = async (request, reply) => {
  try {
    const payload = request.payload;
    const pattern = {role: 'auth', cmd: 'create', email: payload.email, name: payload.name, password: payload.password};

    request.seneca.log.info('POST AUTH', payload);

    return request.seneca.act(pattern, (err, response) => {
      if (err) return reply.badImplementation(err);
      return reply(response.auth);
    });
  } catch (err) {
    return reply.badImplementation(err);
  }
};

export const read = async (request, reply) => {
  try {
    const id = request.params.id;
    const pattern = {role: 'auth', cmd: 'findById', id: id};

    request.seneca.log.info('GET AUTH ID', id);

    return request.seneca.act(pattern, (err, response) => {
      if (err) return reply.badImplementation(err);
      return reply(response.auth);
    });
  } catch (err) {
    return reply.badImplementation(err);
  }
};

export const update = async (request, reply) => {
  try {
    const id = request.params.id;
    const payload = request.payload;
    const pattern = {role: 'auth', cmd: 'update', id: id, email: payload.email, name: payload.name, password: payload.password};

    request.seneca.log.info('PUT AUTH', payload);

    return request.seneca.act(pattern, (err, response) => {
      if (err) return reply.badImplementation(err);
      if (!response.ok) return reply.badRequest(response.why);
      return reply(response.auth);
    });
  } catch (err) {
    return reply.badImplementation(err);
  }
};

export const login = async (request, reply) => {
  try {
    const payload = request.payload;
    const pattern = {role: 'auth', cmd: 'login', email: payload.email, password: payload.password};

    request.seneca.log.info('LOGIN', payload);

    return request.seneca.act(pattern, (err, response) => {
      if (err) return reply.badImplementation(err);
      if (!response.ok) return reply.badRequest(response.why);
      const auth = response.auth;
      const token = getToken(auth.id);

      request.seneca.log.info('ADD CACHE', token);

      const patternCache = {role: 'auth', cmd: 'setToken', token: token, id: auth.id};
      request.seneca.act(patternCache, (err, response) => {
        if (err) return reply.badImplementation(err);
        return reply({token: token});
      });
    });
  } catch (err) {
    return reply.badImplementation(err);
  }
};

export const logout = async (request, reply) => {
  try {
    const token = request.headers.authorization.replace('Bearer ', '');
    const pattern = {role: 'auth', cmd: 'logout', token: token};

    request.seneca.log.info('LOGOUT');

    request.seneca.act(pattern, (err, response) => {
      if (err) return reply.badImplementation(err);
      return reply({ok: true});
    });
  } catch (err) {
    return reply.badImplementation(err);
  }
};

function getToken (id) {
  const secretKey = process.env.JWT || 'template';

  return jwt.sign({
    id: id,
    scope: ['admin']
  }, secretKey, {expiresIn: '2h'});
}
