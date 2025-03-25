import {Outlet, useNavigate, useOutletContext} from "@remix-run/react";

export default function AppCampaign() {
  const outletContext = useOutletContext<{ hideNav: boolean, isLoading: boolean }>();
  return <Outlet context={outletContext} />;
}
