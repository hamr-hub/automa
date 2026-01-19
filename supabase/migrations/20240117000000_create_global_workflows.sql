-- ============================================
-- 全局共享工作流表 (Global Workflows)
-- 用于保存所有人共享的工作流
-- ============================================

BEGIN;

-- ============================================
-- Drop existing tables if they exist
-- ============================================
DROP TABLE IF EXISTS public.global_workflows CASCADE;
DROP TABLE IF EXISTS public.global_workflow_categories CASCADE;

-- ============================================
-- 全局工作流分类表
-- ============================================
CREATE TABLE public.global_workflow_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'riFolderLine',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.global_workflow_categories IS '全局工作流分类：用于组织全局共享工作流的分类';

CREATE INDEX idx_global_workflow_categories_sort_order ON public.global_workflow_categories(sort_order);

-- ============================================
-- 全局工作流表
-- ============================================
CREATE TABLE public.global_workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'riGlobalLine',
  category_id TEXT REFERENCES public.global_workflow_categories(id) ON DELETE SET NULL,
  description TEXT,
  content TEXT,
  drawflow JSONB NOT NULL DEFAULT '{"edges":[],"zoom":1.3,"nodes":[]}'::jsonb,
  table_data JSONB DEFAULT '[]'::jsonb,
  data_columns JSONB DEFAULT '[]'::jsonb,
  trigger JSONB,
  settings JSONB DEFAULT '{}'::jsonb,
  global_data JSONB DEFAULT '{}'::jsonb,
  version TEXT,
  author_name TEXT,
  author_id UUID,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.global_workflows IS '全局共享工作流：所有用户都可以查看和使用的工作流';

-- 索引
CREATE INDEX idx_global_workflows_category_id ON public.global_workflows(category_id);
CREATE INDEX idx_global_workflows_created_at ON public.global_workflows(created_at DESC);
CREATE INDEX idx_global_workflows_downloads ON public.global_workflows(downloads_count DESC);
CREATE INDEX idx_global_workflows_likes ON public.global_workflows(likes_count DESC);
CREATE INDEX idx_global_workflows_featured ON public.global_workflows(is_featured) WHERE is_featured = true;
CREATE INDEX idx_global_workflows_name ON public.global_workflows USING gin(to_tsvector('english', name));
CREATE INDEX idx_global_workflows_tags ON public.global_workflows USING gin(tags);

-- ============================================
-- 用户对全局工作流的操作记录
-- ============================================
CREATE TABLE public.global_workflow_user_actions (
  id BIGSERIAL PRIMARY KEY,
  workflow_id TEXT REFERENCES public.global_workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('download', 'like', 'unlike', 'view')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, user_id, action_type)
);

COMMENT ON TABLE public.global_workflow_user_actions IS '用户对全局工作流的操作记录：记录下载、点赞等行为';

CREATE INDEX idx_global_workflow_user_actions_workflow_id ON public.global_workflow_user_actions(workflow_id);
CREATE INDEX idx_global_workflow_user_actions_user_id ON public.global_workflow_user_actions(user_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- 全局工作流分类：所有人可读，仅创建者可写
ALTER TABLE public.global_workflow_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.global_workflow_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert categories" ON public.global_workflow_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update categories" ON public.global_workflow_categories
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete categories" ON public.global_workflow_categories
  FOR DELETE USING (true);

-- 全局工作流：所有人可读，仅创建者可管理
ALTER TABLE public.global_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view global workflows" ON public.global_workflows
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can insert global workflows" ON public.global_workflows
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Workflow owners can update their workflows" ON public.global_workflows
  FOR UPDATE USING (author_id = auth.uid() OR author_id IS NULL);

CREATE POLICY "Workflow owners can delete their workflows" ON public.global_workflows
  FOR DELETE USING (author_id = auth.uid() OR author_id IS NULL);

-- 用户操作记录：用户只能操作自己的记录
ALTER TABLE public.global_workflow_user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON public.global_workflow_user_actions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own actions" ON public.global_workflow_user_actions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own actions" ON public.global_workflow_user_actions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- Functions & Triggers
-- ============================================

-- 更新时间戳的函数
CREATE OR REPLACE FUNCTION public.update_global_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_global_workflows_updated_at BEFORE UPDATE ON public.global_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_global_workflows_updated_at();

CREATE TRIGGER update_global_workflow_categories_updated_at BEFORE UPDATE ON public.global_workflow_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Helper functions
-- ============================================

-- 获取全局工作流（带下载/点赞状态）
CREATE OR REPLACE FUNCTION public.get_global_workflows(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_category_id TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at'
)
RETURNS TABLE(
  id TEXT,
  name TEXT,
  icon TEXT,
  category_id TEXT,
  description TEXT,
  drawflow JSONB,
  table_data JSONB,
  data_columns JSONB,
  trigger JSONB,
  settings JSONB,
  global_data JSONB,
  version TEXT,
  author_name TEXT,
  downloads_count INTEGER,
  likes_count INTEGER,
  tags TEXT[],
  is_featured BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_has_downloaded BOOLEAN,
  user_has_liked BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 获取当前用户ID（如果有登录）
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION
    WHEN OTHERS THEN v_user_id := NULL;
  END;

  RETURN QUERY
  SELECT
    gw.*,
    CASE WHEN v_user_id IS NOT NULL THEN
      EXISTS (
        SELECT 1 FROM public.global_workflow_user_actions
        WHERE workflow_id = gw.id
          AND user_id = v_user_id
          AND action_type = 'download'
      )
    ELSE false END as user_has_downloaded,
    CASE WHEN v_user_id IS NOT NULL THEN
      EXISTS (
        SELECT 1 FROM public.global_workflow_user_actions
        WHERE workflow_id = gw.id
          AND user_id = v_user_id
          AND action_type = 'like'
      )
    ELSE false END as user_has_liked
  FROM public.global_workflows gw
  WHERE gw.is_active = true
    AND (p_category_id IS NULL OR gw.category_id = p_category_id)
    AND (p_search_query IS NULL OR gw.name ILIKE '%' || p_search_query || '%' OR gw.description ILIKE '%' || p_search_query || '%')
  ORDER BY
    CASE p_sort_by
      WHEN 'downloads' THEN gw.downloads_count
      WHEN 'likes' THEN gw.likes_count
      WHEN 'created_at' THEN gw.created_at
      ELSE gw.created_at
    END DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 记录工作流下载
CREATE OR REPLACE FUNCTION public.record_workflow_download(p_workflow_id TEXT)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION
    WHEN OTHERS THEN v_user_id := NULL;
  END;

  -- 增加下载计数
  UPDATE public.global_workflows
  SET downloads_count = downloads_count + 1
  WHERE id = p_workflow_id;

  -- 记录用户操作（如果已登录）
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.global_workflow_user_actions (workflow_id, user_id, action_type)
    VALUES (p_workflow_id, v_user_id, 'download')
    ON CONFLICT (workflow_id, user_id, action_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 切换工作流点赞
CREATE OR REPLACE FUNCTION public.toggle_workflow_like(p_workflow_id TEXT)
RETURNS TABLE(liked BOOLEAN, likes_count INTEGER) AS $$
DECLARE
  v_user_id UUID;
  v_existing_action TEXT;
BEGIN
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION
    WHEN OTHERS THEN v_user_id := NULL;
  END;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be logged in to like workflows';
  END IF;

  -- 检查是否已经点赞
  SELECT action_type INTO v_existing_action
  FROM public.global_workflow_user_actions
  WHERE workflow_id = p_workflow_id
    AND user_id = v_user_id
    AND action_type = 'like';

  IF v_existing_action IS NULL THEN
    -- 添加点赞
    INSERT INTO public.global_workflow_user_actions (workflow_id, user_id, action_type)
    VALUES (p_workflow_id, v_user_id, 'like');

    UPDATE public.global_workflows
    SET likes_count = likes_count + 1
    WHERE id = p_workflow_id;

    liked := true;
  ELSE
    -- 取消点赞
    DELETE FROM public.global_workflow_user_actions
    WHERE workflow_id = p_workflow_id
      AND user_id = v_user_id
      AND action_type = 'like';

    UPDATE public.global_workflows
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = p_workflow_id;

    liked := false;
  END IF;

  -- 返回最新的点赞数
  SELECT likes_count INTO likes_count
  FROM public.global_workflows
  WHERE id = p_workflow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 默认分类数据
-- ============================================
INSERT INTO public.global_workflow_categories (id, name, description, icon, sort_order) VALUES
  ('cat_automation', 'Automation', 'Common automation workflows', 'riAutomationLine', 1),
  ('cat_web_scraping', 'Web Scraping', 'Data extraction and scraping workflows', 'riScissorsCutLine', 2),
  ('cat_forms', 'Forms', 'Form filling and processing workflows', 'riFileTextLine', 3),
  ('cat_notifications', 'Notifications', 'Alert and notification workflows', 'riNotification3Line', 4),
  ('cat_data_processing', 'Data Processing', 'Data transformation and processing workflows', 'riDatabase2Line', 5);

COMMIT;
