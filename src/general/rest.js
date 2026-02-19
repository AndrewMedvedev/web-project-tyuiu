const basePath = "https://7bca-45-128-99-26.ngrok-free.app/api/v1/courses";

export async function sendData(data) {
  fetch(basePath, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log(JSON.stringify(data));
  return response;
}
