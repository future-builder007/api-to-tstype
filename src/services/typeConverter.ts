// services/typeConverter.ts
import { ApiRequest, ConversionResult, Header, HttpMethod, ExampleUrlsByMethod } from '../types';

// 按 HTTP 方法分组的示例 URL
export const EXAMPLE_URLS_BY_METHOD: ExampleUrlsByMethod = {
  GET: [
    'https://jsonplaceholder.typicode.com/users',
    'https://jsonplaceholder.typicode.com/posts',
    'https://api.github.com/users/octocat',
    'https://httpbin.org/get',
    'https://dummyjson.com/products',
    'https://reqres.in/api/users',
    'https://jsonplaceholder.typicode.com/comments'
  ],
  POST: [
    'https://jsonplaceholder.typicode.com/posts',
    'https://httpbin.org/post',
    'https://reqres.in/api/users',
    'https://dummyjson.com/products/add',
    'https://jsonplaceholder.typicode.com/users'
  ],
  PUT: [
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://httpbin.org/put',
    'https://reqres.in/api/users/2',
    'https://dummyjson.com/products/1',
    'https://jsonplaceholder.typicode.com/users/1'
  ],
  PATCH: [
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://httpbin.org/patch',
    'https://reqres.in/api/users/2',
    'https://dummyjson.com/products/1'
  ],
  DELETE: [
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://httpbin.org/delete',
    'https://reqres.in/api/users/2',
    'https://dummyjson.com/products/1',
    'https://jsonplaceholder.typicode.com/users/1'
  ]
};

// 向后兼容的默认示例 URL（主要是 GET 请求）
export const EXAMPLE_URLS = EXAMPLE_URLS_BY_METHOD.GET;

// 将 Header 数组转换为 Record<string, string>
const headersToRecord = (headers: Header[]): Record<string, string> => {
  return headers.reduce((acc, header) => {
    if (header.key.trim() && header.value.trim()) {
      acc[header.key.trim()] = header.value.trim();
    }
    return acc;
  }, {} as Record<string, string>);
};

// 从 JSON 数据推断 TypeScript 类型
const inferTypeFromValue = (value: any, key?: string): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const type = typeof value;
  
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        // 分析数组中的元素类型
        const elementTypes = new Set(value.map(item => inferTypeFromValue(item)));
        if (elementTypes.size === 1) {
          const elementType = Array.from(elementTypes)[0];
          return elementType === 'object' ? `${generateInterfaceName(key || 'Item')}[]` : `${elementType}[]`;
        }
        return 'any[]';
      }
      return generateInterfaceName(key || 'Object');
    default:
      return 'any';
  }
};

// 生成接口名称
const generateInterfaceName = (key: string): string => {
  const cleaned = key.replace(/[^a-zA-Z0-9]/g, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + 'Type';
};

// 生成 TypeScript 接口
const generateInterface = (obj: any, interfaceName: string, generatedInterfaces: Set<string>): string => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return '';
  }

  let interfaceStr = `interface ${interfaceName} {\n`;
  const nestedInterfaces: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const type = inferTypeFromValue(value, key);
    
    // 如果是对象类型，需要生成嵌套接口
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedInterfaceName = generateInterfaceName(key);
      if (!generatedInterfaces.has(nestedInterfaceName)) {
        generatedInterfaces.add(nestedInterfaceName);
        const nestedInterface = generateInterface(value, nestedInterfaceName, generatedInterfaces);
        if (nestedInterface) {
          nestedInterfaces.push(nestedInterface);
        }
      }
    }
    
    // 如果是数组且包含对象，生成数组元素的接口
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const itemInterfaceName = generateInterfaceName(key.replace(/s$/, '')); // 移除复数形式
      if (!generatedInterfaces.has(itemInterfaceName)) {
        generatedInterfaces.add(itemInterfaceName);
        const itemInterface = generateInterface(value[0], itemInterfaceName, generatedInterfaces);
        if (itemInterface) {
          nestedInterfaces.push(itemInterface);
        }
      }
    }

    interfaceStr += `  ${key}: ${type};\n`;
  }

  interfaceStr += '}';

  return nestedInterfaces.join('\n\n') + (nestedInterfaces.length > 0 ? '\n\n' : '') + interfaceStr;
};

// 转换 API 响应为 TypeScript 类型
export const convertApiToTypes = async (request: ApiRequest): Promise<ConversionResult> => {
  try {
    const { url, method, headers } = request;
    
    // 验证 URL
    if (!url || !url.trim()) {
      throw new Error('请提供有效的 API URL');
    }

    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    // 构建请求配置
    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headersToRecord(headers)
      }
    };

    // 对于非 GET 请求，可能需要添加请求体（这里简化处理）
    if (method !== 'GET' && method !== 'DELETE') {
      // 可以根据需要添加默认的请求体
      // requestConfig.body = JSON.stringify({});
    }

    // 发起请求
    const response = await fetch(fullUrl, requestConfig);

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API 响应不是 JSON 格式');
    }

    const data = await response.json();

    // 生成类型定义
    const generatedInterfaces = new Set<string>();
    let mainInterfaceName = 'ApiResponse';
    
    // 如果是数组，分析第一个元素
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return {
          types: '// API 返回空数组\ntype ApiResponse = any[];',
          requestConfig: {
            method,
            headers: headersToRecord(headers)
          }
        };
      }
      mainInterfaceName = 'ApiResponseItem';
      const itemInterface = generateInterface(data[0], mainInterfaceName, generatedInterfaces);
      const types = itemInterface + '\n\ntype ApiResponse = ' + mainInterfaceName + '[];';
      
      return {
        types,
        requestConfig: {
          method,
          headers: headersToRecord(headers)
        }
      };
    }

    // 如果是对象
    if (typeof data === 'object' && data !== null) {
      const interfaceStr = generateInterface(data, mainInterfaceName, generatedInterfaces);
      
      return {
        types: interfaceStr,
        requestConfig: {
          method,
          headers: headersToRecord(headers)
        }
      };
    }

    // 基本类型
    const basicType = inferTypeFromValue(data);
    return {
      types: `type ApiResponse = ${basicType};`,
      requestConfig: {
        method,
        headers: headersToRecord(headers)
      }
    };

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('转换过程中发生未知错误');
  }
};

// 兼容旧版本的单参数调用
export const convertApiToTypesLegacy = async (url: string): Promise<ConversionResult> => {
  return convertApiToTypes({
    url,
    method: 'GET',
    headers: []
  });
};