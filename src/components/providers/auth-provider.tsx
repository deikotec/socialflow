"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Company, UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  companies: Company[];
  currentCompany: Company | null;
  selectCompany: (companyId: string) => void;
  loading: boolean;
  refreshCompanies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  companies: [],
  currentCompany: null,
  selectCompany: () => {},
  loading: true,
  refreshCompanies: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Wrap fetchCompanies in useCallback to avoid dependency issues in useEffect
  const fetchCompanies = useCallback(async (companyIds: string[]) => {
    if (!companyIds || companyIds.length === 0) {
      setCompanies([]);
      setCurrentCompany(null);
      return;
    }

    try {
      // API limit: "in" query supports up to 10 items.
      const q = query(
        collection(db, "companies"),
        where(documentId(), "in", companyIds),
      );
      const querySnapshot = await getDocs(q);
      const companiesList: Company[] = [];
      querySnapshot.forEach((doc) => {
        companiesList.push({ id: doc.id, ...doc.data() } as Company);
      });
      setCompanies(companiesList);

      if (companiesList.length > 0) {
        // Use functional update to avoid dependency on currentCompany
        setCurrentCompany((prev) => {
          if (prev) return prev;
          const saved = localStorage.getItem("socialflow_last_company");
          const found = companiesList.find((c) => c.id === saved);
          return found || companiesList[0];
        });
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []); // Dependencies are empty as db is stable, and we removed internal state deps

  const selectCompany = (companyId: string) => {
    const selected = companies.find((c) => c.id === companyId);
    if (selected) {
      setCurrentCompany(selected);
      localStorage.setItem("socialflow_last_company", companyId);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUserProfile(data);
            // Verify if data.owned_companies exists and is an array before calling fetchCompanies
            if (data.owned_companies && Array.isArray(data.owned_companies)) {
              await fetchCompanies(data.owned_companies);
            } else {
              setCompanies([]);
              setCurrentCompany(null);
            }
          } else {
            // New user or profile missing
            setUserProfile(null);
            setCompanies([]);
            setCurrentCompany(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
        setCompanies([]);
        setCurrentCompany(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchCompanies]);

  const refreshCompanies = async () => {
    if (userProfile?.owned_companies) {
      await fetchCompanies(userProfile.owned_companies);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        companies,
        currentCompany,
        selectCompany,
        loading,
        refreshCompanies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
