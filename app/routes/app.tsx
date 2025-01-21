import type {HeadersFunction, LoaderFunctionArgs} from "@remix-run/node";
import {Link, Outlet, useLoaderData, useRouteError} from "@remix-run/react";
import {boundary} from "@shopify/shopify-app-remix/server";
import {AppProvider} from "@shopify/shopify-app-remix/react";
import {NavMenu} from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import {authenticate} from "app/shopify.server";
import {db} from "app/db.server";
import {onboardingTable} from "drizzle/schemas";
import {eq} from "drizzle-orm/sql";

export const links = () => [{rel: "stylesheet", href: polarisStyles}];

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const {admin,session} = await authenticate.admin(request);

// Check onboarding status
  const onboarding = await db.select()
    .from(onboardingTable)
    .where(eq(onboardingTable.shop, session.shop))
    .get();

  const hasCompletedOnboarding = onboarding?.hasCompletedOnboarding ?? false;

  return {apiKey: process.env.SHOPIFY_API_KEY || "", hideNav: hasCompletedOnboarding};
};

export default function App() {
  const {apiKey, hideNav} = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      {hideNav && <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/campaign">Campaign</Link>
        <Link to="/app/settings">Settings</Link>
      </NavMenu>}
      {!hideNav && <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/">Onboarding</Link>
      </NavMenu>}
      <Outlet context={{hideNav}}/>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
