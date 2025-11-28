// To display the widget, this script element must be included in the
// login HTML file:
//   <script src="https://www.google.com/recaptcha/api.js"></script>
//
// Frontend has to request the next resource through /api/auth/getCaptchaWidget (already set in authRoutes)
const getCaptchaWidget = (req, res) => {
  res.send(`
    <div class="g-recaptcha" data-sitekey="${process.env.RECAPTCHA_SITE_KEY}"></div>
  `)
}

module.exports = { getCaptchaWidget }