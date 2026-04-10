import type { Category } from './types';
import { largestCitiesHints } from './hints';

export const largestCities: Category = {
  id: 'largest-cities',
  name: 'Largest Cities by Population',
  description: "World's largest urban areas",
  tags: ['geography', 'world'],
  hints: largestCitiesHints,
  items: [
    "Tokyo", "Delhi", "Shanghai", "Dhaka", "Cairo",
    "Beijing", "Mumbai", "Mexico City", "Osaka", "São Paulo",
    "Chongqing", "Karachi", "Istanbul", "Kinshasa", "Lagos",
    "Buenos Aires", "Kolkata", "Manila", "Guangzhou", "Tianjin",
    "Lahore", "Bangalore", "Rio de Janeiro", "Shenzhen", "Moscow",
    "Chennai", "Bogota", "Jakarta", "Paris", "Lima",
    "Bangkok", "Hyderabad", "Seoul", "Nagoya", "London",
    "Chengdu", "Tehran", "Nanjing", "Ho Chi Minh City", "Luanda",
    "Ahmedabad", "Kuala Lumpur", "Xi'an", "Hong Kong", "Dongguan",
    "Hangzhou", "Foshan", "Shenyang", "Riyadh", "Baghdad",
    "Santiago", "Surat", "Madrid", "Suzhou", "Pune",
    "Harbin", "Houston", "Dallas", "Toronto", "Dar es Salaam",
    "Miami", "Belo Horizonte", "Singapore", "Philadelphia", "Atlanta",
    "Fukuoka", "Khartoum", "Barcelona", "Johannesburg", "Saint Petersburg",
    "Qingdao", "Dalian", "Washington DC", "Yangon", "Alexandria",
    "Jinan", "Guadalajara", "Melbourne", "Sydney", "Zhengzhou",
    "New York City", "Chittagong", "Changsha", "Addis Ababa", "Nairobi",
    "Taipei", "Los Angeles", "Chicago", "Abidjan", "Monterrey",
    "Casablanca", "Wuhan", "Jaipur", "Berlin", "Cape Town",
    "Kabul", "Kunming", "Changchun", "Medellín", "Brasília"
  ]
};
