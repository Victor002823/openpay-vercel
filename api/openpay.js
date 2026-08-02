export default async function handler(req, res) {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  return res.status(200).json({
    success: true,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
}
