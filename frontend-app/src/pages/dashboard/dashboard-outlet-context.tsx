export type DashboardOutletUser = { readonly id?: string; readonly userId?: string; readonly email?: string; readonly name?: string; readonly role?: string };

/** Render context only; it is not an authentication, authorization, or tenant authority. */
export type DashboardOutletContext = { readonly user: DashboardOutletUser };
