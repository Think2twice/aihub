-- 用户经验/等级
ALTER TABLE users ADD COLUMN IF NOT EXISTS exp INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1;

-- 签到记录表
CREATE TABLE IF NOT EXISTS user_sign_ins (
  id SERIAL PRIMARY KEY,
  "userId" INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "signInDate" DATE NOT NULL DEFAULT CURRENT_DATE,
  streak INT NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "signInDate")
);

CREATE INDEX IF NOT EXISTS idx_user_sign_ins_user_id ON user_sign_ins("userId");
CREATE INDEX IF NOT EXISTS idx_user_sign_ins_date ON user_sign_ins("signInDate");
