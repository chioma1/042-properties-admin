import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Dashboard from "./dashboard/Dashboard";
import Login from "./auth/Login";
import Register from "./auth/_Register";
import PageNotFound from "./404"

// import Settings from './dashboard/Settings';
import Tables from './dashboard/Tables';
import Users from './dashboard/Users';
import SingleUser from './dashboard/SingleUser';
import Debtors from './dashboard/Debtors';
import Business from './dashboard/business/Business';
import SingleBusiness from './dashboard/business/SingleBusiness';
import SingleAdvert from './dashboard/business/SingleAdvert';
import SingleAdverts from './dashboard/business/SingleAdverts';
import Adverts from './dashboard/Adverts';
import Advertss from './dashboard/Advertss';
import Maps from './dashboard/Maps';

export const publicRoutes = [
  { route: "/login", component: Login },
  { route: "/main", component: Main },
  { route: "*", component: PageNotFound },
];

export const privateRoutes = [
  { route: "/", component: Dashboard },
  // { route: "/sub-category", component: Settings },
  { route: "/tables", component: Tables },
  { route: "/users", component: Users },
  { route: "/users/single-user", component: SingleUser },
  { route: "/settings", component: Debtors },
  { route: "/adverts", component: Adverts },
  { route: "/adverts/single-advert", component: SingleAdvert },
  { route: "/categories", component: Advertss },
  { route: "/categories/single-category", component: SingleAdverts },
  // { route: "/categories", component: Categories },
  { route: "/maps", component: Maps },
  { route: "/business", component: Business },
  { route: "/settings/sub-category", component: SingleBusiness },
];
export const authRoutes = [
  { route: "/login", component: Login }
  // { route: "/register", component: Register },
];
