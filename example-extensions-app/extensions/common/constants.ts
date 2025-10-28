export const HOST = "https://australia-southeast1-reactify-validation-dev.cloudfunctions.net"
export const SHOP_NAME = "decjuba-nz.myshopify.com"

export const PROVINCE_NAMES: { [key: string]: string } = {
  "NTL": "Northland",
  "AUK": "Auckland",
  "WKO": "Waikato",
  "BOP": "Bay of Plenty",
  "GIS": "Gisborne",
  "HKB": "Hawke's Bay",
  "TKI": "Taranaki",
  "MWT": "Manawatu-Wanganui",
  "WGN": "Wellington",
  "TAS": "Tasman",
  "NSN": "Nelson",
  "MBH": "Marlborough",
  "WTC": "West Coast",
  "CAN": "Canterbury",
  "OTA": "Otago",
  "STL": "Southland"
}
export const PROVINCE_CODES: { [key: string]: string } = {
  "Northland": "NTL",
  "Auckland": "AUK",
  "Waikato": "WKO",
  "Bay of Plenty": "BOP",
  "Gisborne": "GIS",
  "Hawke's Bay": "HKB",
  "Taranaki": "TKI",
  "Manawatu-Wanganui": "MWT",
  "Wellington": "WGN",
  "Tasman": "TAS",
  "Nelson": "NSN",
  "Marlborough": "MBH",
  "West Coast": "WTC",
  "Canterbury": "CAN",
  "Otago": "OTA",
  "Southland": "STL"
}

export const POSTCODE_RANGES = [
  {
    title: "Northland",
    province: "NTL",
    ranges: [
      {
        start: 110,
        end: 594,
      },
    ],
  },
  {
    title: "Auckland",
    province: "AUK",
    ranges: [
      {
        start: 600,
        end: 2120,
      },
      {
        start: 2122,
        end: 2341,
      },
      {
        start: 2343,
        end: 2345,
      },
      {
        start: 2471,
        end: 2472,
      },
      {
        start: 2571,
        end: 2684,
      },
    ],
  },
  {
    title: "Waikato",
    province: "WKO",
    ranges: [
      {
        start: 2121,
        end: 2121,
      },
      {
        start: 2342,
        end: 2342,
      },
      {
        start: 2402,
        end: 2441,
      },
      {
        start: 2473,
        end: 2474,
      },
      {
        start: 2693,
        end: 2697,
      },
      {
        start: 3060,
        end: 3060,
      },
      {
        start: 3078,
        end: 3078,
      },
      {
        start: 3081,
        end: 3083,
      },
      {
        start: 3200,
        end: 3610,
      },
      {
        start: 3620,
        end: 3641,
      },
      {
        start: 3643,
        end: 3912,
      },
      {
        start: 3940,
        end: 3945,
      },
      {
        start: 3970,
        end: 3979,
      },
      {
        start: 3981,
        end: 3988,
      },
      {
        start: 4350,
        end: 4350,
      },
    ],
  },
  {
    title: "Bay of Plenty",
    province: "BOP",
    ranges: [
      {
        start: 3010,
        end: 3049,
      },
      {
        start: 3062,
        end: 3077,
      },
      {
        start: 3079,
        end: 3079,
      },
      {
        start: 3096,
        end: 3199,
      },
      {
        start: 3611,
        end: 3611,
      },
      {
        start: 3642,
        end: 3642,
      },
      {
        start: 3642,
        end: 3642,
      },
    ],
  },
  {
    title: "Manawatu-Wanganui",
    province: "MWT",
    ranges: [
      {
        start: 3920,
        end: 3926,
      },
      {
        start: 3946,
        end: 3951,
      },
      {
        start: 3980,
        end: 3980,
      },
      {
        start: 3989,
        end: 3998,
      },
      {
        start: 4410,
        end: 4501,
      },
      {
        start: 4541,
        end: 4543,
      },
      {
        start: 4547,
        end: 4548,
      },
      {
        start: 4571,
        end: 4587,
      },
      {
        start: 4625,
        end: 4632,
      },
      {
        start: 4646,
        end: 4646,
      },
      {
        start: 4660,
        end: 4660,
      },
      {
        start: 4691,
        end: 4999,
      },
      {
        start: 5510,
        end: 5510,
      },
      {
        start: 5540,
        end: 5541,
      },
      {
        start: 5570,
        end: 5573,
      },
      {
        start: 5574,
        end: 5575,
      },
      {
        start: 5583,
        end: 5583,
      },
    ],
  },
  {
    title: "Gisborne",
    province: "GIS",
    ranges: [
      {
        start: 4010,
        end: 4094,
      },
    ],
  },
  {
    title: "Hawke's Bay",
    province: "HKB",
    ranges: [
      {
        start: 4102,
        end: 4295,
      },
    ],
  },
  {
    title: "Taranaki",
    province: "TKI",
    ranges: [
      {
        start: 4310,
        end: 4349,
      },
      {
        start: 4351,
        end: 4399,
      },
    ],
  },
  {
    title: "Taranaki",
    province: "TKI",
    ranges: [
      {
        start: 4310,
        end: 4349,
      },
      {
        start: 4351,
        end: 4399,
      },
      {
        start: 4510,
        end: 4510,
      },
      {
        start: 4520,
        end: 4520,
      },
      {
        start: 4544,
        end: 4545,
      },
      {
        start: 4549,
        end: 4549,
      },
      {
        start: 4588,
        end: 4616,
      },
      {
        start: 4640,
        end: 4645,
      },
      {
        start: 4649,
        end: 4649,
      },
      {
        start: 4671,
        end: 4685,
      },
    ],
  },
  {
    title: "Wellington",
    province: "WGN",
    ranges: [
      {
        start: 5010,
        end: 5391,
      },
      {
        start: 5010,
        end: 5391,
      },
      {
        start: 5512,
        end: 5512,
      },
      {
        start: 5542,
        end: 5544,
      },
      {
        start: 5581,
        end: 5583,
      },
      {
        start: 5710,
        end: 6972,
      },
    ],
  },
  {
    title: "Tasman",
    province: "TAS",
    ranges: [
      {
        start: 7005,
        end: 7007,
      },
      {
        start: 7020,
        end: 7025,
      },
      {
        start: 7048,
        end: 7055,
      },
      {
        start: 7072,
        end: 7096,
      },
      {
        start: 7110,
        end: 7144,
      },
      {
        start: 7146,
        end: 7146,
      },
      {
        start: 7173,
        end: 7175,
      },
      {
        start: 7182,
        end: 7183,
      },
      {
        start: 7196,
        end: 7198,
      },
    ],
  },
  {
    title: "Nelson",
    province: "NSN",
    ranges: [
      {
        start: 7010,
        end: 7011,
      },
      {
        start: 7040,
        end: 7047,
      },
      {
        start: 7071,
        end: 7071,
      },
    ],
  },
  {
    title: "West Coast",
    province: "WTC",
    ranges: [
      {
        start: 7062,
        end: 7062,
      },
      {
        start: 7802,
        end: 7895,
      },
      {
        start: 7071,
        end: 7071,
      },
    ],
  },
  {
    title: "Marlborough",
    province: "MBH",
    ranges: [
      {
        start: 7100,
        end: 7100,
      },
      {
        start: 7145,
        end: 7145,
      },
      {
        start: 7150,
        end: 7150,
      },
      {
        start: 7192,
        end: 7194,
      },
      {
        start: 7201,
        end: 7251,
      },
      {
        start: 7271,
        end: 7285,
      },
    ],
  },
  {
    title: "Canterbury",
    province: "CAN",
    ranges: [
      {
        start: 7260,
        end: 7260,
      },
      {
        start: 7300,
        end: 7791,
      },
      {
        start: 7901,
        end: 8972,
      },
      {
        start: 9412,
        end: 9412,
      },
      {
        start: 9435,
        end: 9435,
      },
      {
        start: 9446,
        end: 9448,
      },
      {
        start: 9498,
        end: 9498,
      },
    ],
  },
  {
    title: "Otago",
    province: "OTA",
    ranges: [
      {
        start: 9010,
        end: 9355,
      },
      {
        start: 9371,
        end: 9410,
      },
      {
        start: 9430,
        end: 9430,
      },
      {
        start: 9441,
        end: 9444,
      },
      {
        start: 9449,
        end: 9495,
      },
      {
        start: 9500,
        end: 9598,
      },
      {
        start: 9748,
        end: 9748,
      },
    ],
  },
  {
    title: "Southland",
    province: "STL",
    ranges: [
      {
        start: 9356,
        end: 9356,
      },
      {
        start: 9600,
        end: 9747,
      },
      {
        start: 9749,
        end: 9893,
      },
    ],
  },
]
