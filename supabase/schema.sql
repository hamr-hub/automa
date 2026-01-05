-- Automa Supabase Database Schema
-- 此文件包含所有必要的表、索引、RLS 策略和函数

-- ============================================
-- 1. 用户表 (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================
-- 2. 工作流表 (Workflows)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflows (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'riGlobalLine',
  folder_id TEXT,
  description TEXT,
  content TEXT,
  connected_table TEXT,
  drawflow JSONB NOT NULL DEFAULT '{"edges":[],"zoom":1.3,"nodes":[]}'::jsonb,
  table_data JSONB DEFAULT '[]'::jsonb,
  data_columns JSONB DEFAULT '[]'::jsonb,
  trigger JSONB,
  settings JSONB DEFAULT '{
    "publicId": "",
    "aipowerToken": "",
    "blockDelay": 0,
    "saveLog": true,
    "debugMode": false,
    "restartTimes": 3,
    "notification": true,
    "execContext": "popup",
    "reuseLastState": false,
    "inputAutocomplete": true,
    "onError": "stop-workflow",
    "executedBlockOnWeb": false,
    "insertDefaultColumn": false,
    "defaultColumnName": "column"
  }'::jsonb,
  global_data JSONB DEFAULT '{"key": "value"}'::jsonb,
  version TEXT,
  is_disabled BOOLEAN DEFAULT false,
  is_protected BOOLEAN DEFAULT false,
  is_host BOOLEAN DEFAULT false,
  host_id TEXT,
  team_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 工作流表索引
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_folder_id ON public.workflows(folder_id);
CREATE INDEX IF NOT EXISTS idx_workflows_team_id ON public.workflows(team_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON public.workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_name ON public.workflows USING gin(to_tsvector('english', name));

-- ============================================
-- 3. 文件夹表 (Folders)
-- ============================================
CREATE TABLE IF NOT EXISTS public.folders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文件夹表索引
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);

-- ============================================
-- 4. 执行日志表 (Logs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflow_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  workflow_id TEXT REFERENCES public.workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'stopped')),
  message TEXT,
  parent_log TEXT,
  team_id UUID,
  collection_id TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日志表索引
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.workflow_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_workflow_id ON public.workflow_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_logs_status ON public.workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_ended_at ON public.workflow_logs(ended_at DESC);

-- ============================================
-- 5. 日志历史数据表 (Log Histories)
-- ============================================
CREATE TABLE IF NOT EXISTS public.log_histories (
  id BIGSERIAL PRIMARY KEY,
  log_id TEXT REFERENCES public.workflow_logs(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日志历史索引
CREATE INDEX IF NOT EXISTS idx_log_histories_log_id ON public.log_histories(log_id);

-- ============================================
-- 6. 日志上下文数据表 (Log Context Data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.log_ctx_data (
  id BIGSERIAL PRIMARY KEY,
  log_id TEXT REFERENCES public.workflow_logs(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日志上下文数据索引
CREATE INDEX IF NOT EXISTS idx_log_ctx_data_log_id ON public.log_ctx_data(log_id);

-- ============================================
-- 7. 日志数据表 (Logs Data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.logs_data (
  id BIGSERIAL PRIMARY KEY,
  log_id TEXT REFERENCES public.workflow_logs(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日志数据索引
CREATE INDEX IF NOT EXISTS idx_logs_data_log_id ON public.logs_data(log_id);

-- ============================================
-- 8. 存储表项表 (Storage Tables Items)
-- ============================================
CREATE TABLE IF NOT EXISTS public.storage_tables (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rows_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 存储表项索引
CREATE INDEX IF NOT EXISTS idx_storage_tables_user_id ON public.storage_tables(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_tables_name ON public.storage_tables(name);

-- ============================================
-- 9. 存储表数据表 (Storage Tables Data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.storage_tables_data (
  id BIGSERIAL PRIMARY KEY,
  table_id BIGINT REFERENCES public.storage_tables(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::jsonb,
  columns_index JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 存储表数据索引
CREATE INDEX IF NOT EXISTS idx_storage_tables_data_table_id ON public.storage_tables_data(table_id);

-- ============================================
-- 10. 变量表 (Variables)
-- ============================================
CREATE TABLE IF NOT EXISTS public.variables (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 变量表索引
CREATE INDEX IF NOT EXISTS idx_variables_user_id ON public.variables(user_id);
CREATE INDEX IF NOT EXISTS idx_variables_name ON public.variables(name);

-- ============================================
-- 11. 凭证表 (Credentials)
-- ============================================
CREATE TABLE IF NOT EXISTS public.credentials (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 凭证表索引
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_name ON public.credentials(name);

-- ============================================
-- 12. 团队表 (Teams)
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. 团队成员表 (Team Members)
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id BIGSERIAL PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  access JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 团队成员索引
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- ============================================
-- 14. 共享工作流表 (Shared Workflows)
-- ============================================
CREATE TABLE IF NOT EXISTS public.shared_workflows (
  id TEXT PRIMARY KEY,
  workflow_id TEXT REFERENCES public.workflows(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES public.users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '["read"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 共享工作流索引
CREATE INDEX IF NOT EXISTS idx_shared_workflows_workflow_id ON public.shared_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS idx_shared_workflows_shared_by ON public.shared_workflows(shared_by);
CREATE INDEX IF NOT EXISTS idx_shared_workflows_shared_with ON public.shared_workflows(shared_with);

-- ============================================
-- 15. 包表 (Packages)
-- ============================================
CREATE TABLE IF NOT EXISTS public.packages (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 包表索引
CREATE INDEX IF NOT EXISTS idx_packages_user_id ON public.packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_name ON public.packages(name);

-- ============================================
-- RLS (Row Level Security) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_ctx_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_tables_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Users 表策略
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Workflows 表策略
CREATE POLICY "Users can view own workflows" ON public.workflows
  FOR SELECT USING (
    auth.uid() = user_id 
    OR id IN (
      SELECT workflow_id FROM public.shared_workflows 
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows" ON public.workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows" ON public.workflows
  FOR DELETE USING (auth.uid() = user_id);

-- Folders 表策略
CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- Workflow Logs 表策略
CREATE POLICY "Users can view own logs" ON public.workflow_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON public.workflow_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON public.workflow_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Log Histories 表策略
CREATE POLICY "Users can view own log histories" ON public.log_histories
  FOR SELECT USING (
    log_id IN (
      SELECT id FROM public.workflow_logs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own log histories" ON public.log_histories
  FOR INSERT WITH CHECK (
    log_id IN (
      SELECT id FROM public.workflow_logs WHERE user_id = auth.uid()
    )
  );

-- Log Context Data 表策略
CREATE POLICY "Users can view own log context data" ON public.log_ctx_data
  FOR SELECT USING (
    log_id IN (
      SELECT id FROM public.workflow_logs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own log context data" ON public.log_ctx_data
  FOR INSERT WITH CHECK (
    log_id IN (
      SELECT id FROM public.workflow_logs WHERE user_id = auth.uid()
    )
  );

-- Logs Data 表策略
CREATE POLICY "Users can view own logs data" ON public.logs_data
  FOR SELECT USING (
    log_id IN (
      SELECT id FROM public.workflow_logs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own logs data" ON public.logs_data
  FOR INSERT WITH CHECK (
    log_id IN (
      SELECT id FROM public.workflow_logs WHERE user_id = auth.uid()
    )
  );

-- Storage Tables 表策略
CREATE POLICY "Users can view own storage tables" ON public.storage_tables
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage tables" ON public.storage_tables
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage tables" ON public.storage_tables
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage tables" ON public.storage_tables
  FOR DELETE USING (auth.uid() = user_id);

-- Storage Tables Data 表策略
CREATE POLICY "Users can view own storage tables data" ON public.storage_tables_data
  FOR SELECT USING (
    table_id IN (
      SELECT id FROM public.storage_tables WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own storage tables data" ON public.storage_tables_data
  FOR INSERT WITH CHECK (
    table_id IN (
      SELECT id FROM public.storage_tables WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own storage tables data" ON public.storage_tables_data
  FOR UPDATE USING (
    table_id IN (
      SELECT id FROM public.storage_tables WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own storage tables data" ON public.storage_tables_data
  FOR DELETE USING (
    table_id IN (
      SELECT id FROM public.storage_tables WHERE user_id = auth.uid()
    )
  );

-- Variables 表策略
CREATE POLICY "Users can view own variables" ON public.variables
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own variables" ON public.variables
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own variables" ON public.variables
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own variables" ON public.variables
  FOR DELETE USING (auth.uid() = user_id);

-- Credentials 表策略
CREATE POLICY "Users can view own credentials" ON public.credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials" ON public.credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials" ON public.credentials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials" ON public.credentials
  FOR DELETE USING (auth.uid() = user_id);

-- Teams 表策略
CREATE POLICY "Team members can view their teams" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Team Members 表策略
CREATE POLICY "Team members can view team members" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Shared Workflows 表策略
CREATE POLICY "Users can view workflows shared with them" ON public.shared_workflows
  FOR SELECT USING (
    shared_with = auth.uid() OR shared_by = auth.uid()
  );

CREATE POLICY "Users can share their workflows" ON public.shared_workflows
  FOR INSERT WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can unshare their workflows" ON public.shared_workflows
  FOR DELETE USING (auth.uid() = shared_by);

-- Packages 表策略
CREATE POLICY "Users can view own packages" ON public.packages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packages" ON public.packages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packages" ON public.packages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packages" ON public.packages
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 触发器函数
-- ============================================

-- 更新 updated_at 时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加 updated_at 触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_tables_updated_at BEFORE UPDATE ON public.storage_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_tables_data_updated_at BEFORE UPDATE ON public.storage_tables_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variables_updated_at BEFORE UPDATE ON public.variables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON public.credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GraphQL 自定义函数
-- ============================================

-- 获取用户的所有工作流（包括共享的）
CREATE OR REPLACE FUNCTION get_user_workflows(user_uuid UUID)
RETURNS SETOF public.workflows AS $$
BEGIN
  RETURN QUERY
  SELECT w.* FROM public.workflows w
  WHERE w.user_id = user_uuid
  UNION
  SELECT w.* FROM public.workflows w
  INNER JOIN public.shared_workflows sw ON w.id = sw.workflow_id
  WHERE sw.shared_with = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取工作流执行统计
CREATE OR REPLACE FUNCTION get_workflow_stats(workflow_uuid TEXT)
RETURNS TABLE(
  total_executions BIGINT,
  success_count BIGINT,
  error_count BIGINT,
  stopped_count BIGINT,
  avg_duration_seconds NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_executions,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as success_count,
    COUNT(*) FILTER (WHERE status = 'error')::BIGINT as error_count,
    COUNT(*) FILTER (WHERE status = 'stopped')::BIGINT as stopped_count,
    AVG(EXTRACT(EPOCH FROM (ended_at - started_at)))::NUMERIC as avg_duration_seconds
  FROM public.workflow_logs
  WHERE workflow_id = workflow_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 批量删除日志
CREATE OR REPLACE FUNCTION delete_logs_before_date(before_date TIMESTAMPTZ, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.workflow_logs
  WHERE user_id = user_uuid AND ended_at < before_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 视图
-- ============================================

-- 工作流执行摘要视图
CREATE OR REPLACE VIEW workflow_execution_summary AS
SELECT 
  w.id as workflow_id,
  w.name as workflow_name,
  w.user_id,
  COUNT(l.id) as total_executions,
  COUNT(l.id) FILTER (WHERE l.status = 'success') as success_count,
  COUNT(l.id) FILTER (WHERE l.status = 'error') as error_count,
  MAX(l.ended_at) as last_execution,
  AVG(EXTRACT(EPOCH FROM (l.ended_at - l.started_at))) as avg_duration_seconds
FROM public.workflows w
LEFT JOIN public.workflow_logs l ON w.id = l.workflow_id
GROUP BY w.id, w.name, w.user_id;

-- ============================================
-- 初始化数据
-- ============================================

-- 插入示例用户（可选，用于测试）
-- INSERT INTO public.users (id, username, email) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'demo_user', 'demo@example.com')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 完成
-- ============================================
-- Schema 创建完成！
-- 
-- 使用说明：
-- 1. 在 Supabase Dashboard 中执行此 SQL 文件
-- 2. 确保启用了 GraphQL API
-- 3. 配置好认证策略
-- 4. 在应用中使用 Supabase Client 连接
