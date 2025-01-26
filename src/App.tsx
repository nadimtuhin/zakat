import React, { useState, useEffect } from 'react';
import { Calculator, Heart, DollarSign, Coins, Gem, Building2, Briefcase } from 'lucide-react';
import currency from 'currency.js';

interface Asset {
  type: string;
  amount: number;
}

interface MetalPrices {
  gold: number;
  silver: number;
}

type MetalUnit = 'g' | 'oz';

interface Country {
  name: string;
  currency: string;
  symbol: string;
  rate: number;
}

const countries: Country[] = [
  { name: 'United States', currency: 'USD', symbol: '$', rate: 1 },
  { name: 'Bangladesh', currency: 'BDT', symbol: '৳', rate: 109.85 },
  { name: 'India', currency: 'INR', symbol: '₹', rate: 83.37 },
  { name: 'Malaysia', currency: 'MYR', symbol: 'RM', rate: 4.77 },
  { name: 'Maldives', currency: 'MVR', symbol: 'Rf', rate: 15.45 },
  { name: 'United Kingdom', currency: 'GBP', symbol: '£', rate: 0.79 },
  { name: 'Saudi Arabia', currency: 'SAR', symbol: '﷼', rate: 3.75 },
  { name: 'UAE', currency: 'AED', symbol: 'د.إ', rate: 3.67 },
  { name: 'Pakistan', currency: 'PKR', symbol: '₨', rate: 278.50 },
  { name: 'Indonesia', currency: 'IDR', symbol: 'Rp', rate: 15785 },
  { name: 'Turkey', currency: 'TRY', symbol: '₺', rate: 31.93 }
];

function App() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    return countries.find(c => c.name === 'Bangladesh') || countries[0];
  });
  const [metalPrices, setMetalPrices] = useState<MetalPrices>({ gold: 0, silver: 0 });
  const [goldWeight, setGoldWeight] = useState(0);
  const [silverWeight, setSilverWeight] = useState(0);
  const [goldUnit, setGoldUnit] = useState<MetalUnit>('g');
  const [silverUnit, setSilverUnit] = useState<MetalUnit>('g');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetalPrices = async () => {
      try {
        const response = await fetch('https://api.metals.live/v1/spot');
        if (!response.ok) throw new Error('Failed to fetch metal prices');
        const data = await response.json();
        const goldPrice = data.find((metal: any) => metal.gold)?.gold || 0;
        const silverPrice = data.find((metal: any) => metal.silver)?.silver || 0;
        setMetalPrices({ 
          gold: goldPrice * selectedCountry.rate,
          silver: silverPrice * selectedCountry.rate
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch metal prices. Please try again later.');
        setLoading(false);
      }
    };
    fetchMetalPrices();
  }, [selectedCountry]);

  const [assets, setAssets] = useState<Asset[]>([
    { type: 'Cash & Bank Balances', amount: 0 },
    { type: 'Gold', amount: goldWeight * (metalPrices.gold / 31.1035) }, // Convert from grams to troy ounces
    { type: 'Silver', amount: silverWeight * (metalPrices.silver / 31.1035) },
    { type: 'Investments & Shares', amount: 0 },
    { type: 'Property for Business', amount: 0 },
    { type: 'Business Inventory', amount: 0 },
  ]);

  const nisabValue = 5200; // Approximate nisab value in USD
  const zakatRate = 0.025; // 2.5%

  const totalWealth = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const zakatPayable = totalWealth >= nisabValue;
  const zakatAmount = zakatPayable ? totalWealth * zakatRate : 0;

  const handleMetalWeightChange = (metal: 'gold' | 'silver', weight: number) => {
    const conversionFactor = 31.1035; // grams per troy ounce
    
    if (metal === 'gold') {
      setGoldWeight(weight);
      const newAssets = [...assets];
      const weightInOunces = goldUnit === 'g' ? weight / conversionFactor : weight;
      newAssets[1].amount = weightInOunces * metalPrices.gold;
      setAssets(newAssets);
    } else {
      setSilverWeight(weight);
      const newAssets = [...assets];
      const weightInOunces = silverUnit === 'g' ? weight / conversionFactor : weight;
      newAssets[2].amount = weightInOunces * metalPrices.silver;
      setAssets(newAssets);
    }
  };

  const handleUnitChange = (metal: 'gold' | 'silver', unit: MetalUnit) => {
    const conversionFactor = 31.1035;
    
    if (metal === 'gold') {
      const newWeight = unit === 'g' ? goldWeight * conversionFactor : goldWeight / conversionFactor;
      setGoldUnit(unit);
      setGoldWeight(newWeight);
      handleMetalWeightChange('gold', newWeight);
    } else {
      const newWeight = unit === 'g' ? silverWeight * conversionFactor : silverWeight / conversionFactor;
      setSilverUnit(unit);
      setSilverWeight(newWeight);
      handleMetalWeightChange('silver', newWeight);
    }
  };

  const handleAssetChange = (index: number, value: number) => {
    const newAssets = [...assets];
    newAssets[index].amount = value;
    setAssets(newAssets);
  };

  const getIconForAssetType = (type: string) => {
    switch (type) {
      case 'Cash & Bank Balances':
        return <DollarSign className="w-5 h-5" />;
      case 'Gold':
        return <Coins className="w-5 h-5" />;
      case 'Silver':
        return <Coins className="w-5 h-5" />;
      case 'Investments & Shares':
        return <Gem className="w-5 h-5" />;
      case 'Property for Business':
        return <Building2 className="w-5 h-5" />;
      case 'Business Inventory':
        return <Briefcase className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return currency(amount, { symbol: selectedCountry.symbol }).format();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-800">Zakat Calculator</h1>
            </div>
            <select
              value={selectedCountry.name}
              onChange={(e) => setSelectedCountry(countries.find(c => c.name === e.target.value) || countries[0])}
              className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              {countries.map(country => (
                <option key={country.currency} value={country.name}>
                  {country.name} ({country.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {assets.map((asset, index) => (
              <div key={asset.type} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {getIconForAssetType(asset.type)}
                  <label className="text-gray-700 font-medium">{asset.type}</label>
                </div>
                {
                  asset.type === 'Gold' || asset.type === 'Silver' ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={asset.type === 'Gold' ? goldWeight : silverWeight}
                          onChange={(e) => handleMetalWeightChange(
                            asset.type.toLowerCase() as 'gold' | 'silver',
                            parseFloat(e.target.value) || 0
                          )}
                          className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder={`Enter weight in ${asset.type === 'Gold' ? goldUnit : silverUnit}`}
                        />
                        <select
                          value={asset.type === 'Gold' ? goldUnit : silverUnit}
                          onChange={(e) => handleUnitChange(
                            asset.type.toLowerCase() as 'gold' | 'silver',
                            e.target.value as MetalUnit
                          )}
                          className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        >
                          <option value="g">g</option>
                          <option value="oz">oz</option>
                        </select>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Current value: {formatCurrency(asset.amount)}
                        {loading && ' (Loading prices...)'}
                        {error && ` (${error})`}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={asset.amount}
                      onChange={(e) => handleAssetChange(index, parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter amount in USD"
                    />
                  )
                }
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-emerald-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Total Wealth:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalWealth)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Nisab Threshold:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(nisabValue * selectedCountry.rate)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-emerald-600" />
                <span className="text-gray-700 font-medium">Zakat Payable:</span>
              </div>
              <span className="text-xl font-bold text-emerald-600">
                {formatCurrency(zakatAmount)}
              </span>
            </div>

            {!zakatPayable && (
              <p className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-lg">
                Note: Zakat is only payable if your total wealth exceeds the Nisab value of {formatCurrency(nisabValue * selectedCountry.rate)}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;