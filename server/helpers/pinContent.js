import axios from "axios";


// export default async function(cid, name) {
async function pinContent() {

  const cid = "QmReP1QDuv1nMdu42cP3YnbxgC6ASQecHGfd12gTEAziL2";
  const name = "image1";
  try {
    // const pinningData = await axios.post("https://api.web3.storage/pins", {
    //   headers: {
    //     Accept: "*/*",
    //     Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczQTg1YzJhQTVmNzU1ZTM4MUUxODhmYkI2ZTg3M0E3MEJGRUQ2RjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMxODkwNjgyOTEsIm5hbWUiOiJtb25hX2JldGEifQ.pONwiaib6R_lPL2bop4cTgk5-Z2Otf4723aDJjEYDLY",
    //     ContentType: "application/json"
    //   }
    // }, {
    //   cid,
    //   name
    // })

    const pinningData = await axios.get("https://api.web3.storage/pins", {
      headers: {
        Accept: "*/*",
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczQTg1YzJhQTVmNzU1ZTM4MUUxODhmYkI2ZTg3M0E3MEJGRUQ2RjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMxODkwNjgyOTEsIm5hbWUiOiJtb25hX2JldGEifQ.pONwiaib6R_lPL2bop4cTgk5-Z2Otf4723aDJjEYDLY",
      }
    })
    console.log(pinningData);
  } catch (e) {
    console.log(e)
    // return e;
  }
}

pinContent();