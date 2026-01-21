/**
 * Price Memory Workflow Block Handler
 * 允许在Automa工作流中使用price-memory相关操作
 */

import priceMemoryClient from '@/services/supabase/PriceMemoryClient';

export async function saveAmazonProduct({ id, data }, { refData }) {
  const {
    url = '{{url}}',
    title = '{{title}}',
    price = '{{price}}',
    currency = 'USD',
    brand = '{{brand}}',
    rating = '{{rating}}',
    reviewCount = '{{reviewCount}}',
    availability = '{{availability}}',
    mainImage = '{{mainImage}}',
    description = '{{description}}',
  } = data;

  try {
    // 初始化客户端
    await priceMemoryClient.initialize();

    // 获取实际的URL值
    const actualUrl = (await renderString(url, refData, this.engine.isPopup))
      .value;

    if (!actualUrl) {
      throw new Error('Product URL is required');
    }

    // 构建商品数据
    const productData = {
      product_url: actualUrl,
      title:
        (await renderString(title, refData, this.engine.isPopup)).value || null,
      current_price:
        (await renderString(price, refData, this.engine.isPopup)).value || null,
      currency: currency || 'USD',
      brand:
        (await renderString(brand, refData, this.engine.isPopup)).value || null,
      rating:
        parseFloat(
          (await renderString(rating, refData, this.engine.isPopup)).value
        ) || null,
      review_count:
        parseInt(
          (await renderString(reviewCount, refData, this.engine.isPopup)).value
        ) || null,
      availability:
        (await renderString(availability, refData, this.engine.isPopup))
          .value || null,
      main_image_url:
        (await renderString(mainImage, refData, this.engine.isPopup)).value ||
        null,
      description:
        (await renderString(description, refData, this.engine.isPopup)).value ||
        null,
    };

    // 获取站点信息并设置site_id
    const site = await priceMemoryClient.getSiteByUrl(actualUrl);
    if (site) {
      productData.site_id = site.id;
    }

    // 保存商品
    const product = await priceMemoryClient.saveProductDetail(productData);

    return {
      data: product,
      productUrl: actualUrl,
      nextBlockId: this.getBlockConnections(id),
    };
  } catch (error) {
    console.error('Save Amazon Product failed:', error);
    throw error;
  }
}

export async function savePriceHistory({ id, data }, { refData }) {
  const {
    productUrl = '{{url}}',
    price = '{{price}}',
    currency = 'USD',
    priceType = 'regular',
    availability = '{{availability}}',
  } = data;

  try {
    // 初始化客户端
    await priceMemoryClient.initialize();

    // 获取实际的URL值
    const actualUrl = (
      await renderString(productUrl, refData, this.engine.isPopup)
    ).value;

    if (!actualUrl) {
      throw new Error('Product URL is required');
    }

    // 获取商品详情以获取product_id
    const product = await priceMemoryClient.getProductDetail(actualUrl);

    if (!product) {
      throw new Error('Product not found. Please save the product first.');
    }

    // 构建价格数据
    const priceData = {
      product_id: product.id,
      site_id: product.site_id,
      product_url: actualUrl,
      asin: product.asin,
      price: parseFloat(
        (await renderString(price, refData, this.engine.isPopup)).value
      ),
      currency: currency || 'USD',
      price_type: priceType || 'regular',
      availability:
        (await renderString(availability, refData, this.engine.isPopup))
          .value || null,
    };

    // 保存价格历史
    const history = await priceMemoryClient.savePriceHistory(priceData);

    return {
      data: history,
      productUrl: actualUrl,
      nextBlockId: this.getBlockConnections(id),
    };
  } catch (error) {
    console.error('Save Price History failed:', error);
    throw error;
  }
}

export async function getProductDetails({ id, data }, { refData }) {
  const { productUrl = '{{url}}' } = data;

  try {
    // 初始化客户端
    await priceMemoryClient.initialize();

    // 获取实际的URL值
    const actualUrl = (
      await renderString(productUrl, refData, this.engine.isPopup)
    ).value;

    // 获取商品详情
    const product = await priceMemoryClient.getProductDetail(actualUrl);

    return {
      data: product,
      productUrl: actualUrl,
      nextBlockId: this.getBlockConnections(id),
    };
  } catch (error) {
    console.error('Get Product Details failed:', error);
    throw error;
  }
}

export async function getPriceHistory({ id, data }, { refData }) {
  const { productUrl = '{{url}}', limit = 30 } = data;

  try {
    // 初始化客户端
    await priceMemoryClient.initialize();

    // 获取实际的URL值
    const actualUrl = (
      await renderString(productUrl, refData, this.engine.isPopup)
    ).value;

    // 获取价格历史
    const history = await priceMemoryClient.getPriceHistory(actualUrl, limit);

    return {
      data: history,
      productUrl: actualUrl,
      nextBlockId: this.getBlockConnections(id),
    };
  } catch (error) {
    console.error('Get Price History failed:', error);
    throw error;
  }
}

export async function addToFavorites({ id, data }, { refData }) {
  const { productUrl = '{{url}}', notes = '' } = data;

  try {
    // 初始化客户端
    await priceMemoryClient.initialize();

    // 获取实际的URL值
    const actualUrl = (
      await renderString(productUrl, refData, this.engine.isPopup)
    ).value;

    // 获取用户
    const user = await priceMemoryClient.getCurrentUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // 获取商品
    const product = await priceMemoryClient.getProductDetail(actualUrl);

    if (!product) {
      throw new Error('Product not found');
    }

    // 添加关注
    const favorite = await priceMemoryClient.addFavoriteProduct(
      user.id,
      product.id,
      (await renderString(notes, refData, this.engine.isPopup)).value
    );

    return {
      data: favorite,
      productUrl: actualUrl,
      nextBlockId: this.getBlockConnections(id),
    };
  } catch (error) {
    console.error('Add to Favorites failed:', error);
    throw error;
  }
}

export async function getFavoriteProducts({ id }) {
  try {
    // 初始化客户端
    await priceMemoryClient.initialize();

    // 获取用户
    const user = await priceMemoryClient.getCurrentUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // 获取关注列表
    const favorites = await priceMemoryClient.getFavoriteProducts(user.id);

    return {
      data: favorites,
      nextBlockId: this.getBlockConnections(id),
    };
  } catch (error) {
    console.error('Get Favorite Products failed:', error);
    throw error;
  }
}

// 辅助函数：渲染字符串模板
function renderString(template, refData) {
  // 简单的模板渲染，支持 {{variable}} 格式
  let result = template;

  if (refData) {
    // 替换 refData 中的变量
    Object.keys(refData).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, refData[key]);
    });
  }

  return { value: result };
}

export default {
  saveAmazonProduct,
  savePriceHistory,
  getProductDetails,
  getPriceHistory,
  addToFavorites,
  getFavoriteProducts,
};
