const t = Date.now();
const winloc = window.location.href.split('?')[0]
const queryString = window.location.search;
const a  = Object.entries(window.all_traits);
let timer, asset;

$(function() {
  loadTraits();
  $('#token_id').keyup(loadTokenAsset);

  $('.layer_select').change(function() {
    loadImage();
  });

  $('#download_button').click(function() {
    canvas = document.getElementById('pfp');
    downloadCanvas(canvas);
  });

  $('#download_banner').click(function() {
    canvas = document.getElementById('banner_preview');
    downloadCanvas(canvas);
  });

  $('select').select2();

  $('.loader').hide();
});

const loadTokenAsset = function () {
  const KEY = 'Ve9KHdBix4MmGqEhZafmJ';
  const options = { method: 'GET' };
  const address = '0x7cab6c0e4dc14b995901f5d672cdcc8469cc459d';
  const token_id = $(this).val();
  const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${KEY}/getNFTMetadata?contractAddress=${address}&tokenId=${token_id}`;

  $('.loader').show();
  clearTimeout(timer);
  timer = setTimeout(function () {
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => setMainAsset(data.image.originalUrl))
      .catch((err) => console.error(err));
  }, 500);
  $('.loader').hide();
};

const setMainAsset = function(url) {
  asset = url.replace('width=512', 'width=2000');
  loadImage();
  loadBannerImage();
}

const loadTraits = function() {
  let bodies = [];
  for(const[k,v] of Object.entries(a[0][1])) {
    $('#body_select').append('<option value="'+v+'">'+k+'</option>');
  }
  a.slice(1).forEach(function(traits_map) {
    for(const[k,v] of Object.entries(traits_map[1])) {
      layer_id = '#layer'+v.charAt(0);
      $(layer_id).append('<option value="'+v+'">'+k+'</option>');
    }
  });
  console.log('Traits Loaded');
}

const loadImage = async function() {
  canvas = await generatePfpImage();
  const dataURL = canvas.toDataURL('image/png');
  const pfp = document.getElementById('pfp');
  const ctx = pfp.getContext('2d');
  pfp.width = 1000;
  pfp.height = 1000;
  img = newImage(dataURL);
  await preload(dataURL)
  .then(function() {
    ctx.drawImage(
      img, 0, 0, 1000, 1000
    );
  });
  loadBannerImage();
}

const generatePfpImage = async function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  var images = [newImage(asset)];

  let body_type = $('#body_select').val();
  let layerOrder = [6,1,2,3,4,5];
  layerOrder.forEach(function(i) {
    let layer = '#layer'+i;
    console.log(layer)
    console.log($(layer).hasClass('body_type'));
    if($(layer).hasClass('body_type')) {
      s = body_type + $(layer).val();
    } else {
      s = $(layer).val();
    }
    if (s == null) { return }
    if(s.slice(-2) == '00') {
      s = '0'
    }
    image_path = 'assets/' + s + '.png?' + t;
    console.log(image_path)
    images.push(newImage(image_path));
  });

  canvas.width = 1000;
  canvas.height = 1000;

  return Promise.all(images.map(img => new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Failed to load image: ' + img.src));
  }))).then(() => {
    images.forEach(img => {
      ctx.drawImage(
        img, 0, 0, 1000, 1000
      );
    });
    return canvas;
  }).catch(error => {
    console.error(error);
  });
}

const loadBannerImage = function() {
  main_asset = newImage(asset);
  main_asset.crossOrigin="anonymous";
  const canvas = document.getElementById('banner_preview');
  const ctx = canvas.getContext('2d');
  canvas.width = 1500;
  canvas.height = 500;
  ctx.imageSmoothingEnabled = false;
  preload(asset)
  .then(function() {
    ctx.drawImage(
      main_asset, 0, 0
    );
    var p = ctx.getImageData(0, 0, 1, 1).data;
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      main_asset, 1000, -200, 1000, 1000
    );
    ctx.drawImage(
      main_asset, 650, 100, 500, 500
    );
    ctx.drawImage(
      main_asset, 450, 300, 250, 250
    );
    logo_url = './assets/301.png';
    logo = newImage(logo_url);
    preload(logo_url)
    .then(function() {
      ctx.drawImage(
        logo, 0, 0, 1500, 1500
      );
    });
  })
}

const preload = function(src) {
  return new Promise(function(resolve, reject) {
    const img = new Image();
    img.onload = function() {
      resolve(src);
    }
    img.onerror = function() {
      console.error('Failed to load image: ' + src);
    }
    img.src = src;
  });
}

const newImage = function(f) {
  const img = new Image();
  img.crossOrigin="anonymous";
  img.src = f;
  return img;
}

const rgbToHex = function(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

const downloadCanvas = function(canvas) {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'image.png';
  link.click();
}

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {type:mimeString});
}
