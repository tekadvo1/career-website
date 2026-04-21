// AI Credits system disabled — all users have unlimited AI access
const checkAICredits = (req, res, next) => {
  next();
};

module.exports = { checkAICredits };
