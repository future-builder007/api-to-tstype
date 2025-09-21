import React, { useState } from 'react';
import { Copy, Download, CheckCircle, AlertCircle, Code, Globe, Loader2, Plus, X, Settings } from 'lucide-react';
import { convertApiToTypes, EXAMPLE_URLS, EXAMPLE_URLS_BY_METHOD } from '../services/typeConverter';
import { AppState, HttpMethod, Header } from '../types';

const TypeQuickConverter: React.FC = () => {
  const [state, setState] = useState<AppState>({
    url: '',
    method: 'GET' as HttpMethod,
    headers: [],
    generatedTypes: '',
    loading: false,
    error: '',
    copied: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleGenerate = async () => {
    if (!state.url.trim()) {
      updateState({ error: '请输入有效的 API URL' });
      return;
    }

    try {
      updateState({ loading: true, error: '' });
      const result = await convertApiToTypes({
        url: state.url,
        method: state.method,
        headers: state.headers
      });
      updateState({ 
        generatedTypes: result.types,
        loading: false 
      });
    } catch (err) {
      updateState({ 
        error: err instanceof Error ? err.message : '生成类型定义时出错，请检查 API URL 是否有效',
        loading: false 
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.generatedTypes);
      updateState({ copied: true });
      setTimeout(() => updateState({ copied: false }), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([state.generatedTypes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'types.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUrlChange = (newUrl: string) => {
    updateState({ url: newUrl, error: '' });
  };

  const handleMethodChange = (method: HttpMethod) => {
    updateState({ method, error: '' });
  };

  const handleAddHeader = () => {
    const newHeaders = [...state.headers, { key: '', value: '' }];
    updateState({ headers: newHeaders });
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...state.headers];
    newHeaders[index][field] = value;
    updateState({ headers: newHeaders });
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = state.headers.filter((_, i) => i !== index);
    updateState({ headers: newHeaders });
  };

  const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TypeQuick Converter
              </h1>
              <p className="text-sm text-gray-600">将 API URL 转换为 TypeScript 类型定义</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">API 配置</h2>
          </div>
          
          <div className="space-y-4">
            {/* URL Input */}
            <div className="relative">
              <input
                type="url"
                value={state.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="输入 API URL，例如: https://api.example.com/users"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>

            {/* HTTP Method Selection */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 self-center mr-2">请求方法:</span>
              {httpMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => handleMethodChange(method)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                    state.method === method
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>高级设置</span>
                <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
              </button>
            </div>

            {/* Advanced Settings - Headers */}
            {showAdvanced && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-800">自定义请求头</h3>
                  <button
                    onClick={handleAddHeader}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加</span>
                  </button>
                </div>
                
                {state.headers.length === 0 ? (
                  <p className="text-sm text-gray-500">暂无自定义请求头</p>
                ) : (
                  <div className="space-y-2">
                    {state.headers.map((header, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="键名 (如: Authorization)"
                          value={header.key}
                          onChange={(e) => handleUpdateHeader(index, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="值 (如: Bearer token)"
                          value={header.value}
                          onChange={(e) => handleUpdateHeader(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleRemoveHeader(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {state.error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={state.loading || !state.url.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {state.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  <span>生成 TypeScript 类型</span>
                </>
              )}
            </button>

            {/* Example URLs */}
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">示例 URL ({state.method}):</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_URLS_BY_METHOD[state.method].map((exampleUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleUrlChange(exampleUrl)}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  >
                    {exampleUrl.replace('https://', '').split('/')[0]}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        {state.generatedTypes && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-800">生成的类型定义</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {state.copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>复制</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>下载</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm border max-h-96 overflow-y-auto">
                <code className="text-gray-800">{state.generatedTypes}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">多方法支持</h3>
            <p className="text-gray-600">支持 GET、POST、PUT、PATCH、DELETE 等多种 HTTP 方法，满足不同 API 需求</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">自定义请求头</h3>
            <p className="text-gray-600">支持添加自定义请求头，如 Authorization、Content-Type 等，适配各种 API 认证</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">一键导出</h3>
            <p className="text-gray-600">支持复制到剪贴板或下载为 .ts 文件，方便集成到项目中</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Powered by TypeQuick - 让 API 类型定义变得简单</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TypeQuickConverter;