/**
 * Price Memory Product Client
 * 用于保存亚马逊商品数据到Supabase数据库
 * 与 price-spider 和 price-admin 共享相同的数据库结构
 */

import { createClient } from '@supabase/supabase-js';
import supabaseConfig from '@/config/supabase.config';

class PriceMemoryClient {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * 初始化 Supabase 客户端
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const { supabaseUrl, supabaseAnonKey } =
        supabaseConfig.default || supabaseConfig;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[PriceMemory] Supabase configuration missing');
        return;
      }

      this.client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      });

      this.initialized = true;
      // Client initialized successfully
    } catch (err) {
      console.warn('[PriceMemory] Initialization failed:', err.message);
      this.client = null;
      this.initialized = false;
    }
  }

  /**
   * 获取所有站点
   */
  async getSites() {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('sites')
        .select('*')
        .eq('enabled', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('[PriceMemory] getSites failed:', error.message);
      return [];
    }
  }

  /**
   * 根据URL获取站点ID
   */
  async getSiteByUrl(productUrl) {
    if (!this.client) return null;

    try {
      const { data: sites, error } = await this.client
        .from('sites')
        .select('*')
        .eq('enabled', true);

      if (error) throw error;

      // 查找匹配的站点
      for (const site of sites || []) {
        if (productUrl.includes(site.base_url)) {
          return site;
        }
      }

      return null;
    } catch (error) {
      console.warn('[PriceMemory] getSiteByUrl failed:', error.message);
      return null;
    }
  }

  /**
   * 保存商品详情
   * @param {object} productData - 商品数据
   */
  async saveProductDetail(productData) {
    if (!this.client) throw new Error('PriceMemory not connected');

    try {
      const { data, error } = await this.client
        .from('product_details')
        .upsert([productData], {
          onConflict: 'product_url',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Product saved
      return data;
    } catch (error) {
      console.warn('[PriceMemory] saveProductDetail failed:', error.message);
      throw error;
    }
  }

  /**
   * 批量保存商品详情
   * @param {array} products - 商品数据数组
   */
  async saveProductDetailsBatch(products) {
    if (!this.client) throw new Error('PriceMemory not connected');

    try {
      const { data, error } = await this.client
        .from('product_details')
        .upsert(products, {
          onConflict: 'product_url',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;

      // Batch save completed
      return data;
    } catch (error) {
      console.warn(
        '[PriceMemory] saveProductDetailsBatch failed:',
        error.message
      );
      throw error;
    }
  }

  /**
   * 保存商品URL
   * @param {object} urlData - URL数据
   */
  async saveProductUrl(urlData) {
    if (!this.client) throw new Error('PriceMemory not connected');

    try {
      const { data, error } = await this.client
        .from('product_urls')
        .upsert([urlData], {
          onConflict: 'product_url',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Product URL saved
      return data;
    } catch (error) {
      console.warn('[PriceMemory] saveProductUrl failed:', error.message);
      throw error;
    }
  }

  /**
   * 保存价格历史
   * @param {object} priceData - 价格数据
   */
  async savePriceHistory(priceData) {
    if (!this.client) throw new Error('PriceMemory not connected');

    try {
      const { data, error } = await this.client
        .from('price_history')
        .insert([priceData])
        .select()
        .single();

      if (error) throw error;

      // Price history saved
      return data;
    } catch (error) {
      console.warn('[PriceMemory] savePriceHistory failed:', error.message);
      throw error;
    }
  }

  /**
   * 获取商品详情
   * @param {string} productUrl - 商品URL
   */
  async getProductDetail(productUrl) {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('product_details')
        .select('*')
        .eq('product_url', productUrl)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.warn('[PriceMemory] getProductDetail failed:', error.message);
      return null;
    }
  }

  /**
   * 获取商品价格历史
   * @param {string} productUrl - 商品URL
   * @param {number} limit - 返回数量限制
   */
  async getPriceHistory(productUrl, limit = 30) {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('price_history')
        .select('*')
        .eq('product_url', productUrl)
        .order('crawled_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('[PriceMemory] getPriceHistory failed:', error.message);
      return [];
    }
  }

  /**
   * 获取所有商品详情（可按条件筛选）
   * @param {object} options - 查询选项
   */
  async getProductDetails(options = {}) {
    if (!this.client) return [];

    try {
      const {
        siteId,
        limit = 50,
        offset = 0,
        orderBy = 'created_at',
        order = 'desc',
      } = options;

      let query = this.client
        .from('product_details')
        .select('*', { count: 'exact' });

      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      query = query
        .order(orderBy, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count };
    } catch (error) {
      console.warn('[PriceMemory] getProductDetails failed:', error.message);
      return { data: [], count: 0 };
    }
  }

  /**
   * 获取用户的关注商品
   * @param {string} userId - 用户ID
   */
  async getFavoriteProducts(userId) {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('user_favorite_products')
        .select(
          `
          *,
          product:product_details(*)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('[PriceMemory] getFavoriteProducts failed:', error.message);
      return [];
    }
  }

  /**
   * 添加关注商品
   * @param {string} userId - 用户ID
   * @param {number} productId - 商品ID
   * @param {string} notes - 备注
   */
  async addFavoriteProduct(userId, productId, notes = '') {
    if (!this.client) throw new Error('PriceMemory not connected');

    try {
      const { data, error } = await this.client
        .from('user_favorite_products')
        .upsert(
          [
            {
              user_id: userId,
              product_id: productId,
              notes,
            },
          ],
          {
            onConflict: 'user_id_product_id',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Favorite product added
      return data;
    } catch (error) {
      console.warn('[PriceMemory] addFavoriteProduct failed:', error.message);
      throw error;
    }
  }

  /**
   * 取消关注商品
   * @param {string} userId - 用户ID
   * @param {number} productId - 商品ID
   */
  async removeFavoriteProduct(userId, productId) {
    if (!this.client) throw new Error('PriceMemory not connected');

    try {
      const { error } = await this.client
        .from('user_favorite_products')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      // Favorite product removed
      return { success: true };
    } catch (error) {
      console.warn(
        '[PriceMemory] removeFavoriteProduct failed:',
        error.message
      );
      throw error;
    }
  }

  /**
   * 从亚马逊页面提取商品数据并保存
   * @param {object} pageData - 从页面提取的数据
   * @param {string} productUrl - 商品URL
   */
  async extractAndSaveProduct(pageData, productUrl) {
    // 获取站点信息
    const site = await this.getSiteByUrl(productUrl);
    if (!site) {
      throw new Error('Site not found for URL: ' + productUrl);
    }

    // 解析ASIN
    const asin = this.extractAsin(productUrl);

    // 构建商品数据
    const productData = {
      site_id: site.id,
      product_url: productUrl,
      asin,
      title: pageData.title || null,
      brand: pageData.brand || null,
      current_price: pageData.price || null,
      currency: pageData.currency || this.getCurrencyFromSite(site),
      rating: pageData.rating || null,
      review_count: pageData.reviewCount || null,
      availability: pageData.availability || null,
      main_image_url: pageData.mainImage || null,
      images: pageData.images ? JSON.stringify(pageData.images) : null,
      basic_info: pageData.basicInfo
        ? JSON.stringify(pageData.basicInfo)
        : null,
      product_details: pageData.productDetails
        ? JSON.stringify(pageData.productDetails)
        : null,
      description: pageData.description || null,
    };

    // 保存商品详情
    const product = await this.saveProductDetail(productData);

    // 如果有价格，保存价格历史
    if (pageData.price && product) {
      await this.savePriceHistory({
        product_id: product.id,
        site_id: site.id,
        product_url: productUrl,
        asin,
        price: pageData.price,
        currency: pageData.currency || this.getCurrencyFromSite(site),
        price_type: 'regular',
        availability: pageData.availability || null,
      });
    }

    return product;
  }

  /**
   * 从URL提取ASIN
   */
  extractAsin(url) {
    try {
      // 匹配 /dp/ASIN 或 /gp/product/ASIN 格式
      const asinMatch = url.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/i);
      if (asinMatch) {
        return asinMatch[2];
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 从站点获取货币
   */
  getCurrencyFromSite(site) {
    const currencyMap = {
      US: 'USD',
      GB: 'GBP',
      DE: 'EUR',
      FR: 'EUR',
      JP: 'JPY',
      CA: 'CAD',
      AU: 'AUD',
      SG: 'SGD',
      IN: 'INR',
      IT: 'EUR',
      ES: 'EUR',
    };
    return currencyMap[site.country_code] || 'USD';
  }
}

// 创建单例实例
const priceMemoryClient = new PriceMemoryClient();

export default priceMemoryClient;
