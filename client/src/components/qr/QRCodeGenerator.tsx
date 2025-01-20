"use client";

import React, { useState } from "react";
import { getGeneratedQr } from "@/app/Api";

const QRCodeGenerator = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      // Wywołanie API w celu wygenerowania kodu QR
      const qr = await getGeneratedQr(""); // Pusty token, aby działało bez logowania
      setQrCode(qr);
    } catch (err) {
      setError("Failed to generate QR code. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    // Tworzenie linku do pobrania obrazu
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrCode}`;
    link.download = "qrcode.png";
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-10">Generate Your QR Code</h1>

      <div className="flex flex-col items-center">
        <button
          onClick={generateQRCode}
          className="px-6 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate QR Code"}
        </button>

        {qrCode && (
          <div className="mt-6 flex flex-col items-center">
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="Generated QR Code"
              className="w-48 h-48 border border-gray-300 rounded-md"
            />
            <button
              onClick={downloadQRCode}
              className="mt-4 px-6 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
            >
              Download QR Code
            </button>
          </div>
        )}

        {error && <p className="mt-6 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
