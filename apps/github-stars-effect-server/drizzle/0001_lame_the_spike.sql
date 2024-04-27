-- Custom SQL migration file, put you code below! --
CREATE VIRTUAL TABLE starred_repo_idx USING fts5 (
  name,
  full_name,
  owner,
  language,
  description,
  topics,
  content = 'starred_repo',
  content_rowid = 'id',
  tokenize = "trigram remove_diacritics 1"
);

--> statement-breakpoint

CREATE TRIGGER starred_repo_after_insert AFTER INSERT ON starred_repo BEGIN
INSERT INTO
  starred_repo_idx (
    rowid,
    name,
    full_name,
    owner,
    language,
    description,
    topics
  )
VALUES
  (
    new.id,
    new.name,
    new.full_name,
    JSON_EXTRACT(new.owner, '$.login'),
    new.language,
    new.description,
    new.topics
  );

END;

--> statement-breakpoint

CREATE TRIGGER starred_repo_after_delete AFTER DELETE ON starred_repo BEGIN
INSERT INTO
  starred_repo_idx (
    starred_repo_idx,
    rowid,
    name,
    full_name,
    owner,
    language,
    description,
    topics
  )
VALUES
  (
    'delete',
    old.id,
    old.name,
    old.full_name,
    JSON_EXTRACT(old.owner, '$.login'),
    old.language,
    old.description,
    old.topics
  );

END;

--> statement-breakpoint

CREATE TRIGGER starred_repo_after_update AFTER
UPDATE ON starred_repo BEGIN
INSERT INTO
  starred_repo_idx (
    rowid,
    name,
    full_name,
    owner,
    language,
    description,
    topics
  )
VALUES
  (
    new.id,
    new.name,
    new.full_name,
    JSON_EXTRACT(new.owner, '$.login'),
    new.language,
    new.description,
    new.topics
  );

INSERT INTO
  starred_repo_idx (
    rowid,
    name,
    full_name,
    owner,
    language,
    description,
    topics
  )
VALUES
  (
    new.id,
    new.name,
    new.full_name,
    JSON_EXTRACT(new.owner, '$.login'),
    new.language,
    new.description,
    new.topics
  );

END;
