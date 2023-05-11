

export async function getAlly(req, res) {
  try {
    const allPins = await Pin.find();
    if (!allPins) return res.status(404).send("No Pins Found!");
    return res.status(200).send(allPins);
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}