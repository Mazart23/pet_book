"use client";

import { useState } from "react";
import axios from "axios";

const QRPage = () => {
  const [qrCode, setQrCode] = useState<string | null>(null); // State to store QR code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the QR code from the backend
      const response = await axios.get("/api/qrcode/generate");
      setQrCode(response.data.qr); // Assuming the backend returns { qr: "base64encodedQRCode" }
    } catch (err: any) {
      setError("Failed to generate QR code. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16"> {/* Zwiększono padding na górze */}
      <h1 className="text-3xl font-bold text-center mb-10">Generate Your QR Code</h1>

      <div className="flex flex-col items-center justify-center">
        <div className="mb-12"> {/* Sekcja przycisku z większym odstępem */}
          <button
            onClick={generateQRCode}
            className="px-6 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate QR Code"}
          </button>
        </div>

        {qrCode && (
          <div className="mt-6">
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="Generated QR Code"
              className="w-48 h-48 border border-gray-300 rounded-md"
            />
            <p className="mt-2 text-center text-gray-500">Scan the code to view your profile!</p>
          </div>
        )}

        {error && <p className="mt-6 text-red-500">{error}</p>} {/* Większy margines od góry */}
      </div>
    </div>
  );
};

export default QRPage;
