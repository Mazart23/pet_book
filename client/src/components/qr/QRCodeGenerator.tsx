"use client";

import React, { useEffect, useState } from "react";
import { getGeneratedQr } from "@/app/Api";

const QRCodeGenerator = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getGeneratedQr("")
      .then((qr) => {
        setQrCode(qr);
      })
      .catch((err) => {
        setError("Failed to generate QR code. Please try again.");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Efekt wywoływany tylko raz przy ładowaniu komponentu

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrCode}`;
    link.download = "qrcode.png";
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-10">Your QR Code</h1>

      <div className="flex flex-col items-center">
        {loading && <p>Loading...</p>}

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
