// EXTENDED CONFIG (on top of app.json)
module.exports = ({ config }) => {
  return {
    extra :{
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
    ...config,
  };
};