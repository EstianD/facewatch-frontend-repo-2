import axios from "axios";

export default async function signup(SignupUser) {
  const Url = "/api/users/register";

  const res = await axios.post(`${Url}`, SignupUser);
  // console.log(res.data);

  return res.data;
}
