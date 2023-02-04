export async function xxx(req, res) {
  try {
  } catch (error) {
    res.status(500).send({ message: `Video router error ${error.message}` });
  }
}
