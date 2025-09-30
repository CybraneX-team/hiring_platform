
interface ProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  availability?: any[];
  location?: string;
  locationData?: {
    lat: number;
    lng: number;
    address: string;
  } | null;
}


export interface UpdatedData {
  profile?: Partial<ProfileData>;
  education?: any[];
  experiences?: any[];
  certifications?: any[];
}
export const isValid = (v: any) => {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
};

export const appendIf = (fd: FormData, key: string, val: any) => {
  if (isValid(val)) {
    fd.append(key, typeof val === "object" ? JSON.stringify(val) : String(val));
  }
};

const parseEducationPeriod = (period: string): string | undefined => {
  if (!period) return undefined;

  return period;
};

export const processEducation = (arr: any[]) =>
  arr
    .filter(e => e.institution?.trim())
    .map(e => ({
      institure: e.institution ?? e.institure ?? "",
      Graduation: parseEducationPeriod(e.period),
      Degree: e.type ?? e.Degree ?? "",
      GPA: e.description?.includes("GPA:")
        ? e.description.replace("GPA: ", "")
        : e.GPA ?? "",
    }));

export const processExperiences = (arr: any[]) =>
  arr
    .filter(x => x.company?.trim())
    .map(x => ({
      company: x.company ?? "",
      title: x.title ?? "",
      points: x.points ?? [],
      description: x.points?.length
        ? x.points.map((p: any) => p.point).join("\n")
        : x.description ?? "",
    }));

export const processCerts = (arr: any[]) =>
  arr
    .filter(c => c.name?.trim())
    .map(c => ({
      name: c.name,
      issuer: c.issuer ?? "Unknown Issuer",
      date: c.date ?? "Unknown Date",
      description: c.description ?? "",
    }));