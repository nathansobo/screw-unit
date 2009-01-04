function raises_exception(fn) {
  try {
    fn();
  }
  catch(e) {
    return true;
  }
  return false;
}
