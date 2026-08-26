import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp, type AppRole } from "../context/AppContext";
import { getUserRoleFromSupabase } from "../lib/supabase";

interface Props {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user } = useApp();
  const [verifying, setVerifying] = useState(true);
  const [actualRole, setActualRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function verifyDatabaseRole() {
      if (!user.isLoggedIn || user.id.startsWith("usr-guest")) {
        if (isMounted) {
          setActualRole("customer");
          setVerifying(false);
        }
        return;
      }

      // Fast check: if session role matches allowedRoles (e.g. restaurant_admin), pass immediately
      if (allowedRoles.includes(user.role)) {
        if (isMounted) {
          setActualRole(user.role);
          setVerifying(false);
        }
        return;
      }

      // Re-verify against database or local role map
      const dbRole = await getUserRoleFromSupabase(user.id, user.email);
      if (isMounted) {
        setActualRole(dbRole);
        setVerifying(false);
      }
    }
    verifyDatabaseRole();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.email, user.isLoggedIn, user.role, allowedRoles.join(",")]);

  if (verifying) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <p className="mt-3 text-xs font-bold text-neutral-400">Verifying access permissions...</p>
      </div>
    );
  }

  // Check if unauthenticated
  if (!user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const userRole = actualRole || user.role;

  // Role verification check
  if (!allowedRoles.includes(userRole)) {
    if (userRole === "restaurant_admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/menu" replace />;
  }

  return <>{children}</>;
}
