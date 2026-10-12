// app/about/page.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-full">
          <span className="text-2xl font-bold text-red-600">DTU</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">About DTU Shop</h1>
      </div>
      <Separator className="mb-6 bg-red-100" />

      <Card className="border-red-100">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-700">Official University Store</h2>
            <p className="text-lg text-gray-700">
              DTU Shop is the official merchandise store of Delhi Technological University, 
              offering authentic university-branded products to students, alumni, faculty, 
              and supporters worldwide.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-700">Our Products</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Official DTU apparel and accessories</li>
              <li>University-branded stationery and gifts</li>
              <li>Limited edition alumni merchandise</li>
              <li>Campus memorabilia and collectibles</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-700">Our Mission</h2>
            <p className="text-gray-700">
              We aim to foster university pride and spirit through quality merchandise while 
              supporting student initiatives and campus development projects through our sales.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-700">Campus Pickup</h2>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-gray-700">
                DTU students and staff can enjoy convenient campus pickup at our 
                <span className="font-semibold text-red-600"> Main Campus Store</span> located 
                near the university library.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-700">Contact</h2>
            <div className="border border-red-200 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>DTU Shop Headquarters</strong><br />
                Shahbad Daulatpur, Main Bawana Road<br />
                Delhi - 110042, India<br />
                Email: shop@dtu.ac.in<br />
                Phone: +91-11-2787-1023
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
