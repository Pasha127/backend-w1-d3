const errorHandler = (err, req, res, next) => {
  switch (err){
    case err.status === 400:
      res.status(400).send({ message: err.message, errorsList: err.errorsList });
      console.log("400 in errorHandler", err.status);
      break;

    case err.status === 401:
      res.status(401).send({ message: err.message });
      console.log("401 in errorHandler", err.status);
      break;

    case err.status === 404:
      res.status(404).send({ success: false, message: err.message });
      console.log("404 in errorHandler", err.status);
      break;

    default:
      console.log("500 in errorHandler", err.status);
      res.status(500).send({ message: "Generic Server Error - Error Logged - We're on our way to fix it!" });
  }
}

export default errorHandler;

