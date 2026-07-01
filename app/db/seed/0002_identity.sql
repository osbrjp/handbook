-- Identity seed (POC personas). Content lives in git (src/content/pages/*.md),
-- so this is D1's ONLY seed: who may sign in. No groups seeded by default; the
-- restricted visibility tier is supported but unused out of the box.
INSERT INTO users (email, role, name) VALUES ('editor@osbrjp.com', 'editor', 'Editor');
INSERT INTO users (email, role, name) VALUES ('reader@osbrjp.com', 'reader', 'Reader');
