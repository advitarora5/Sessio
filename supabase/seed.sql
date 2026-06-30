-- Seed data for local development.

insert into public.spots (name, description, area, lat, lng, tags)
values
  (
    'Grainger Level 2',
    'Quiet engineering library tables with dependable outlets and late-night focus energy.',
    'Engineering Quad',
    40.1125,
    -88.2269,
    array['quiet', 'outlets', 'late-night']
  ),
  (
    'ECEB Atrium',
    'Bright open tables near labs and project rooms, best for collaborative grind blocks.',
    'Engineering Quad',
    40.1148,
    -88.2284,
    array['collaborative', 'outlets', 'bright']
  ),
  (
    'Business Instructional Facility',
    'Polished study lounges and group rooms with steady daytime traffic.',
    'South Campus',
    40.1038,
    -88.2291,
    array['group-rooms', 'coffee', 'busy']
  ),
  (
    'EnterpriseWorks',
    'Research Park focus space for interns, founders, and applied research sprints.',
    'Research Park',
    40.0955,
    -88.2417,
    array['research', 'startup', 'quiet']
  ),
  (
    'Main Library Reading Room',
    'Classic long-form reading room for humanities, writing, and exam prep.',
    'Main Quad',
    40.1047,
    -88.2299,
    array['silent', 'reading', 'historic']
  ),
  (
    'Siebel Center Commons',
    'Casual CS study zone for debugging, whiteboarding, and quick peer help.',
    'North Quad',
    40.1139,
    -88.2249,
    array['cs', 'collaborative', 'whiteboards']
  )
on conflict (name) do update
set
  description = excluded.description,
  area = excluded.area,
  lat = excluded.lat,
  lng = excluded.lng,
  tags = excluded.tags;
