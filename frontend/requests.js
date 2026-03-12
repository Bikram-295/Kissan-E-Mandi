import axios from "axios";

//note : retrieve requests fetch an array with only one element, not an entire array. common pitfall
export const fetcher = (url) => {
  return axios.get(url).then((res) => res.data);
};

export const creator = (url, { arg }) => {
  console.log("POSTING to:", url, "Body:", arg);
  return axios
    .post(url, arg)
    .then((res) => {
      console.log("POST Success:", res.data);
      return res.data;
    })
    .catch((error) => {
      console.error("POST Error details:", error.response ? error.response.data : error.message);
      throw error;
    });
};



export const updater = (url, { arg }) =>
{
    console.log(arg)
    return axios
    .put(`${url}${arg.id}/`, JSON.stringify(arg) ,{ headers: { "Content-Type" : "application/json"} })
    .then((res) => res.data);
}

