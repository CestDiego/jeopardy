import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const benefits = [
  {
    title: "Rich in Nutrients",
    description: "Packed with vitamins, minerals, and antioxidants",
  },
  {
    title: "Low Glycemic Index",
    description: "Great for maintaining stable blood sugar levels",
  },
  {
    title: "Versatile Flavor",
    description: "Can be used in various desserts and beverages",
  },
  {
    title: "Natural Sweetener",
    description: "A healthier alternative to processed sugars",
  },
];

const RukumaLandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-green-100 to-yellow-200">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0  bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-green-400/30" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-6xl font-bold text-yellow-800 mb-6 drop-shadow-lg">
            Discover Rukuma
          </h1>
          <p className="text-2xl text-yellow-700 mb-8 drop-shadow">
            Experience the golden treasure of Peru: Lucuma
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-white to-yellow-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-yellow-800 mb-12 relative">
            What is Lucuma?
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400" />
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200 to-green-200 transform rotate-3 rounded-lg" />
            </div>
            <div className="md:w-1/2">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Lucuma is a subtropical fruit native to Peru, often called "Gold
                of the Incas". It has a unique, maple-like sweetness and a soft,
                dry texture similar to a cooked egg yolk.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Rich in nutrients and low in sugar, Lucuma has been used for
                centuries in Peruvian cuisine and is now gaining popularity
                worldwide as a superfood and natural sweetener.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-tl from-yellow-100 to-green-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center text-yellow-800 mb-12 relative">
            Benefits of Lucuma
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                // biome-ignore lint:
                key={index}
                className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
              >
                <CardHeader>
                  <CardTitle className="text-yellow-700">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-green-400 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500 mix-blend-multiply" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">
            Try Rukuma Today!
          </h2>
          <p className="text-xl mb-8 drop-shadow">
            Experience the delicious and nutritious power of Lucuma
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-yellow-500 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Order Now
          </Button>
        </div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </section>
    </div>
  );
};

export default RukumaLandingPage;
