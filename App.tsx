import React, { useState, useCallback } from 'react';
import { AspectRatio, GeneratedAd } from './types';
import { ASPECT_RATIOS, STANDARD_AD_SIZES } from './constants';
import { generateImage, generateAllAdCopies } from './services/geminiService';
import { MagicIcon, AdsIcon } from './components/icons';
import LoadingSpinner from './components/LoadingSpinner';

const TONES = ['Professional', 'Playful', 'Urgent', 'Friendly'];

const ToneSelector: React.FC<{ selected: string; onSelect: (tone: string) => void }> = ({ selected, onSelect }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Ad Copy Tone</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONES.map(tone => (
                <button
                    key={tone}
                    type="button"
                    onClick={() => onSelect(tone)}
                    className={`px-3 py-2 text-sm rounded-md transition-all duration-200 ${selected === tone ? 'bg-indigo-600 text-white font-semibold shadow-lg' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                >
                    {tone}
                </button>
            ))}
        </div>
    </div>
);

const AspectRatioSelector: React.FC<{ selected: AspectRatio; onSelect: (ar: AspectRatio) => void }> = ({ selected, onSelect }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Image Aspect Ratio</label>
        <div className="grid grid-cols-5 gap-2">
            {ASPECT_RATIOS.map(ar => (
                <button
                    key={ar}
                    type="button"
                    onClick={() => onSelect(ar)}
                    className={`px-3 py-2 text-sm rounded-md transition-all duration-200 ${selected === ar ? 'bg-indigo-600 text-white font-semibold shadow-lg' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                >
                    {ar}
                </button>
            ))}
        </div>
    </div>
);

const AdBanner: React.FC<{ ad: GeneratedAd; image: string }> = ({ ad, image }) => {
    const { size, headline, cta } = ad;
    const aspectRatio = size.width / size.height;

    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">{size.name} - {size.width}x{size.height}</h3>
            <div
                className="relative overflow-hidden rounded-lg shadow-2xl bg-cover bg-center text-white flex flex-col justify-between p-4 transform transition-transform hover:scale-105"
                style={{
                    backgroundImage: `url(${image})`,
                    aspectRatio: `${aspectRatio}`,
                    maxWidth: `${size.width}px`
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative z-10 flex-grow flex items-center">
                    <h4 className="text-xl md:text-2xl font-bold text-shadow" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{headline}</h4>
                </div>
                <div className="relative z-10 text-right">
                    <a href="#" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors duration-200 shadow-lg">
                        {cta}
                    </a>
                </div>
            </div>
        </div>
    );
};


export default function App() {
    const [productDescription, setProductDescription] = useState<string>('');
    const [productUrl, setProductUrl] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [tone, setTone] = useState<string>('Professional');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
    const [isLoadingAds, setIsLoadingAds] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateImage = useCallback(async () => {
        if (!productDescription) {
            setError('Please provide a product description.');
            return;
        }
        setError(null);
        setIsLoadingImage(true);
        setGeneratedImage(null);
        setGeneratedAds([]);

        try {
            const image = await generateImage(productDescription, aspectRatio);
            setGeneratedImage(image);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoadingImage(false);
        }
    }, [productDescription, aspectRatio]);

    const handleGenerateAds = useCallback(async () => {
        if (!productDescription) {
            setError('Product description is missing.');
            return;
        }
        setError(null);
        setIsLoadingAds(true);
        setGeneratedAds([]);

        try {
            const ads = await generateAllAdCopies(productDescription, productUrl, tone);
            setGeneratedAds(ads);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoadingAds(false);
        }
    }, [productDescription, productUrl, tone]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                        AI Banner Ad Generator
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        Create stunning, high-quality banner ads in seconds using the power of Gemini.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Control Panel */}
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Product Description</label>
                                <textarea
                                    id="description"
                                    rows={5}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 text-white p-3"
                                    placeholder="e.g., A handcrafted leather wallet with RFID protection, available in brown and black."
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">Product URL</label>
                                <input
                                    type="url"
                                    id="url"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 text-white p-3"
                                    placeholder="https://example.com/product"
                                    value={productUrl}
                                    onChange={(e) => setProductUrl(e.target.value)}
                                />
                            </div>
                            
                            <ToneSelector selected={tone} onSelect={setTone} />
                            
                            <AspectRatioSelector selected={aspectRatio} onSelect={setAspectRatio} />

                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            
                            <div className="space-y-4">
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={isLoadingImage || isLoadingAds}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isLoadingImage ? <LoadingSpinner /> : <><MagicIcon /> Generate Base Image</>}
                                </button>
                                {generatedImage && (
                                    <button
                                        onClick={handleGenerateAds}
                                        disabled={isLoadingAds || isLoadingImage}
                                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isLoadingAds ? <LoadingSpinner /> : <><AdsIcon /> Create Banner Ads</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Display Area */}
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 min-h-[500px]">
                         {isLoadingImage && (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                 <LoadingSpinner />
                                 <p className="mt-4">Generating your stunning product image...</p>
                            </div>
                         )}

                         {!isLoadingImage && generatedImage && (
                             <div>
                                <h2 className="text-2xl font-bold mb-4 text-gray-200">Generated Base Image</h2>
                                <img src={generatedImage} alt="Generated product" className="rounded-lg shadow-xl w-full" />
                             </div>
                         )}
                         
                         {isLoadingAds && (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-8">
                                <LoadingSpinner />
                                <p className="mt-4">Crafting compelling ad copy for all sizes...</p>
                             </div>
                         )}

                        {!isLoadingImage && !isLoadingAds && !generatedImage && generatedAds.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <MagicIcon />
                                <p className="mt-2 text-center">Your generated ads will appear here.</p>
                                <p className="text-sm text-center">Start by entering a description and generating an image.</p>
                            </div>
                        )}

                        {generatedAds.length > 0 && !isLoadingAds && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-6 text-gray-200">Your Generated Banner Ads</h2>
                                <div className="space-y-6">
                                    {generatedAds.map(ad => (
                                        <AdBanner key={ad.size.name} ad={ad} image={generatedImage!} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}