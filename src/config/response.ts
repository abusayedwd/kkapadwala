const response = (responseArg: Record<string, unknown> = {}) => {
  const responseObject: Record<string, unknown> = {
    code: responseArg.statusCode,
    message: responseArg.message,
    data: {},
  };

  if (responseArg.type) {
    (responseObject.data as Record<string, unknown>).type = responseArg.type;
  }

  if (responseArg.data) {
    (responseObject.data as Record<string, unknown>).attributes = responseArg.data;
  }

  if (responseArg.token) {
    (responseObject.data as Record<string, unknown>).token = responseArg.tokens;
  }

  return responseObject;
};

export default response;
