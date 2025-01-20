"use client";

import React, { useEffect, useState } from "react";
import { getGeneratedQr } from "@/app/Api";
import useToken from "../contexts/TokenContext";

const QRCodeGenerator = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useToken();

  useEffect(() => {
    if (token) {
      setLoading(true);
      setError(null);

      getGeneratedQr(token)
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
    }
  }, [token]);

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrCode}`;
    link.download = "qrcode.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">

      <h1 className="text-3xl font-bold text-center mb-10">Your QR Code</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">

      {loading && (
            <div className="w-48 h-48 mb-4 border border-gray-600 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Generating...</p>
            </div>
          )}


        {qrCode && (
          <div className="mt-6 flex flex-col items-center">
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="Generated QR Code"
              className="w-48 h-48 mb-4 border border-gray-600 rounded-lg"
            />

            <button
              onClick={downloadQRCode}
              className="mt-4 px-6 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
            >
              Download QR Code
            </button>

          </div>
        )}

        {error && (
          <p className="mt-6 text-red-500 bg-gray-800 px-4 py-2 rounded">
            {error}
          </p>
        )}

      </div>
    </div>
  );
};

export default QRCodeGenerator;
