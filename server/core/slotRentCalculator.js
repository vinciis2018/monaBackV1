
export function slotRentCalculator(req, res) {
  const c = req.body.c // expected cost to reach one person (0.1 to 0.5) INR
  const f = req.body.f // average footfall in front of screen per day
  const t = req.body.t // time period of 1 slot (in seconds)
  const h = req.body.h // average operational hours per day
  const M = req.body.M // Reach Multiplier
  const D = req.body.D // Diagonal length of the screen (in inches)
  const L = req.body.L // current playlist length

  const slotRent = (c*f*t*M*D)/((L+1)*h*60*60)
  console.log(slotRent);
}