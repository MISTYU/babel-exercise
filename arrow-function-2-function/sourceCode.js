const sum = (a, b) => {
  console.log(this)
  const minus = (a, b) => {
    console.log(this)
    return a - b
  }
  return a + b;
}
