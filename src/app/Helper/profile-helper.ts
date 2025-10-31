
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

export const processCerts = (certs: any[]): { data: any[]; files: File[] } => {
  const data: any[] = [];
  const files: File[] = [];

  certs.forEach((cert) => {
    // ✅ Mark if this cert has a NEW file
    const hasNewFile = cert.file && cert.file instanceof File;
    
    data.push({
      name: cert.name || "",
      issuer: cert.issuer || "",
      date: cert.date || "",
      description: cert.description || "",
      fileUrl: cert.certificateUrl || "",
      fileName: cert.certificateFileName || "",
      mimeType: cert.certificateMime || "",
    });

    if (hasNewFile) {
      files.push(cert.file);
    }
  });

  return { data, files };
};

// Helper function to transform API profile data into component state format
  export const convertDescriptionToPoints = (description: string): string[] => {
    if (!description) return [""];

    // Split by common bullet point indicators
    const points = description
      .split(/[\n•\-\*]/)
      .map((point) => point.trim())
      .filter((point) => point.length > 0 && point.length > 5) // Filter very short points
      .map((point) => point.replace(/^[\-\*\•]\s*/, ""));

    return points.length > 0 ? points : [description];
  };

export const transformProfileData = (apiProfile: any) => {
  return {
    profile: {
      bio: apiProfile.bio || "",
      skills: apiProfile.skills || [],
      languages: apiProfile.languages || [],
      unavailability: apiProfile.unavailability || [],
      location: apiProfile.locationData || null,
      phoneNumber: apiProfile.phoneNumber || "",
    },
    education: apiProfile.education?.map((edu: any, index: any) => ({
      id: index + 1,
      type: edu.Degree || "Degree",
      period: edu.period || "",
      institution: edu.institure || edu.institute || "",
      description: edu.GPA ? `GPA: ${edu.GPA}` : "",
    })) || [],
    experiences: apiProfile.WorkExperience?.map((exp: any, index: any) => ({
      id: index + 1,
      title: exp.title || "",
      company: exp.company || "",
      period: exp.period || "",
      description: exp.description || "",
      points: exp.points || (exp.description ? convertDescriptionToPoints(exp.description) : []),
    })) || [],
    certifications: apiProfile.certificates?.map((cert: any, index: any) => ({
      id: index + 1,
      name: cert.name || "",
      issuer: cert.issuer || "",
      date: cert.date || "",
      description: cert.description || "",
      certificateUrl: cert.fileUrl || "",
      certificateFileName: cert.fileName || "",
      certificateMime: cert.mimeType || "",
    })) || [],
    schedule: {
      availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
      timezone: "Eastern Standard Time",
      preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
    },
  };
};

export const getMissingFields = (profileData : any) => {
  const missing: string[] = [];

  if (!profileData?.skills  || profileData.skills.length === 0) {
    missing.push("skills");
  }

  if (!profileData?.phoneNumber || profileData.phoneNumber.trim().length < 5) {
    missing.push("Phone Number");
  }

  if (!profileData?.locationData) {
    missing.push("Location");
  }

  if (!profileData?.WorkExperience || profileData.WorkExperience.length === 0) {
    missing.push("Work Experience");
  }

  return missing;
};


