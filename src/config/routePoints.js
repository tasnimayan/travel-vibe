
const apiRouting = {
  user:'/api/users',
  home:"/",
}
const userRoutePoints = {
  signup:'/signup',
  login:'/login',
  recover:'/account/recover',               // recovery credentials will be given to this route
  enterOTP:'/account/recover/confirm',    // verification opt will be posted to this route
  resetPassword:'/resetpassword',         // user will enter new password to this route
  profile:'/:username',
}

const homeRoutePoints = {
  settings:'/settings/?tabs',  // params can define in which option of setting needs to be changed
  post:'/post/:id',            // Post details routing point
  organizationFeed:'/organizations/:org_id'

}