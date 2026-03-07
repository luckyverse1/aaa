export type Direction = 'long' | 'short';
export type Outcome = 'tapped' | 'failed';
export type VoteType = 'like' | 'dislike';

export interface Profile {
  id: string;
  username: string;
  group_id: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  admin_id: string;
  member_count: number;
  created_at: string;
}

// A tag row joined onto a live level
export interface LevelTag {
  id: string;
  level_id: string;
  tag_id: string;
  count: number;
  tags: { id: string; text: string };
}

// A tag snapshot stored on an archived level
export interface ArchivedLevelTag {
  id: string;
  archived_level_id: string;
  tag_text: string;
  count: number;
}

export interface Level {
  id: string;
  price: number;
  direction: Direction;
  take_profit: number | null;
  stop_loss: number | null;
  group_id: string;
  creator_id: string;
  likes: number;
  dislikes: number;
  score: number;
  created_at: string;
  last_interaction_at: string;
  // Joined fields
  creator?: Profile;
  user_vote?: VoteType | null;
  level_tags?: LevelTag[];
}

export interface Vote {
  id: string;
  level_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
  updated_at: string;
}

export interface ArchivedLevel {
  id: string;
  original_level_id: string | null;
  group_id: string;
  price: number;
  direction: Direction;
  take_profit: number | null;
  stop_loss: number | null;
  creator_id: string;
  outcome: Outcome;
  likes: number;
  dislikes: number;
  score: number;
  created_at: string;
  archived_at: string;
  // Joined fields
  creator?: Profile;
  archived_level_tags?: ArchivedLevelTag[];
  level_uploads?: LevelUpload[];
}

export interface LevelUpload {
  id: string;
  archived_level_id: string;
  user_id: string;
  image_path: string | null;    // storage path, used to generate signed URL
  image_url?: string | null;    // resolved at runtime from signed URL
  body: string | null;
  created_at: string;
  uploader?: Profile;
}
