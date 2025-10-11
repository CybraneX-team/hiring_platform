"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path, Circle, Image } from "@react-pdf/renderer";

// Register a font with good unicode coverage if needed; fallback to Helvetica
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

export interface ResumeData {
  name: string;
  title?: string;
  location?: string;
  available?: boolean;
  imageUrl?: string;
  experience?: string;
  skills?: string[];
  certifications?: Array<{ name?: string; issuer?: string; date?: string; description?: string; fileUrl?: string }>;
  experience_details?: Array<{ title?: string; company?: string; period?: string; description?: string; points?: Array<{ point: string }> }>;
  academics?: Array<{ level?: string; institution?: string; completed?: boolean }>;
  languages?: string[];
  contact?: { phone?: string; email?: string };
  companyLogo?: string;
  bio?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 40,
    paddingBottom: 72, // leave space for footer on all pages
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
    color: '#444',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
     alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111827',
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    marginRight: 8,
  },
  imageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  line: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    marginBottom: 6,
  },
  listItem: {
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#76FF82',
    color: 'rgba(0, 0, 0, 2.5)',
    marginRight: 6,
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  },
  col: { flexGrow: 1, flexBasis: 0 },
  metaRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 24, // ensure margin from bottom
    left: 32,
    right: 32,
    textAlign: 'center',
    color: '#666',
    fontSize: 9,
  },
});

export const ResumePDF: React.FC<{ data: ResumeData; generatedOn?: string }> = ({ data, generatedOn }) => {
  const dateText = generatedOn || new Date().toLocaleDateString('en-GB');
  const footerText = `Extracted from ProjectMATCH, COMPSCOPE Nonmetallics | www.compscope.in | Generated on: ${dateText}`;

  // Helper to get initials
  const initials = (data.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={[styles.row, styles.spaceBetween, { marginBottom: 8 }]}>
            <View>
              <Text style={styles.name}>{data.name || 'Unknown Name'}</Text>
              {data.title && (<Text style={styles.subtitle}>{data.title}</Text>)}
            </View>

            {data.companyLogo && (
              <Image
                src={data.companyLogo}
                style={{ width: 90, height: 40, objectFit: 'contain' }}
              />
            )}
          </View>
          <View style={styles.metaRow}>
            {data.location ? (
              <View style={styles.metaItem}>
                <Svg width={10} height={10} viewBox="0 0 24 24">
                  <Path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#2563eb" />
                </Svg>
                <Text style={{ ...styles.metaText, marginLeft: 4 }}>{data.location}</Text>
              </View>
            ) : null}
            {/* {typeof data.available === 'boolean' ? (
              <View style={styles.metaItem}>
                <Svg width={10} height={10} viewBox="0 0 24 24">
                  <Circle cx={12} cy={12} r={5} fill={data.available ? '#10B981' : '#EF4444'} />
                </Svg>
                <Text style={{ ...styles.metaText, marginLeft: 4, marginTop: 2 }}>{data.available ? 'Available' : 'Unavailable'}</Text>
              </View>
            ) : null} */}
            {data.experience ? (
              <View style={styles.metaItem}>
                <Svg width={10} height={10} viewBox="0 0 24 24">
                  <Path d="M12 1a11 11 0 100 22 11 11 0 000-22zm0 2a9 9 0 110 18 9 9 0 010-18zm.5 4h-1v6l5 3 .5-.866-4.5-2.634V7z" fill="#6B7280" />
                </Svg>
                <Text style={{ ...styles.metaText, marginLeft: 4, marginTop: 3 }}>
                  <Text style={{ fontWeight: 700 }}>Experience: </Text>
                  {data.experience}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.line} />

        {data.bio && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text>{data.bio}</Text>
          </View>
        )}

        {data.skills && data.skills.length > 0 && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {data.skills.map((s, i) => (
                <Text key={i} style={styles.badge}>{s}</Text>
              ))}
            </View>
          </View>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>Certificates</Text>
            {data.certifications.map((c, i) => (
              <View key={i} style={styles.listItem}>
                <Text>{c.name || 'Certificate'}{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${c.date})` : ''}</Text>
                {c.description ? <Text>{c.description}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {data.experience_details && data.experience_details.length > 0 && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience_details.map((e, i) => (
              <View key={i} style={styles.card}>
                <Text style={{ fontWeight: 700 }}>{e.title || ''}</Text>
                <Text style={{ color: '#374151' }}>{[e.company, e.period].filter(Boolean).join(' • ')}</Text>
                {Array.isArray(e.points) && e.points.length > 0 ? (
                  <View style={{ marginTop: 4 }}>
                    {e.points.map((p, idx) => (
                      <Text key={idx}>• {p.point}</Text>
                    ))}
                  </View>
                ) : e.description ? (
                  <Text>{e.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {(data.academics && data.academics.length > 0) || (data.languages && data.languages.length > 0) ? (
          <View style={[styles.section]} wrap>
            <View style={styles.grid}>
              <View style={styles.col}>
                {data.academics && data.academics.length > 0 && (
                  <View>
                    <Text style={styles.sectionTitle}>Academics</Text>
                    {data.academics.map((a, i) => (
                      <Text key={i} style={styles.listItem}>{[a.level, a.institution].filter(Boolean).join(' — ')}</Text>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.col}>
                {data.languages && data.languages.length > 0 && (
                  <View>
                    <Text style={styles.sectionTitle}>Languages</Text>
                    <Text>{data.languages.join(', ')}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : null}

        {data.contact && (data.contact.email || data.contact.phone) && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>Contact</Text>
            {data.contact.phone ? <Text>Phone No : {data.contact.phone}</Text> : null}
            {data.contact.email ? <Text>Mail : {data.contact.email}</Text> : null}
          </View>
        )}

        <Text fixed style={styles.footer}>{footerText}</Text>
      </Page>
    </Document>
  );
};

export default ResumePDF;


