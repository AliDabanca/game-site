Test linki: https://game-site-a2k0.onrender.com

Bu proje, kullanıcıların oyunlara giriş yapıp skorlarını kaydedebildiği ve liderlik tablolarını görebildiği bir sistemdir. Tüm bu işlemleri "API" adı verilen arka uç yapısı sağlar.

1. Kullanıcı Kaydı ve Girişi (Auth)
Yeni bir kullanıcı siteye kaydolduğunda, bilgileri veritabanına kaydedilir.

Giriş yaptığında, sistem ona özel bir "anahtar" (token) verir.

Bu token, kullanıcının giriş yaptığını göstermek için kullanılır.

2. Kullanıcı Kimliği Doğrulama
Kullanıcı bir sayfaya gitmek ya da skor kaydetmek istediğinde, yanında bu token'ı getirir.

Sistem bu token'ı kontrol eder: geçerliyse devam eder, değilse erişim izni vermez.

3. Skor Kaydetme
Oyun bittikten sonra, kullanıcı skorunu sisteme gönderir.

Sistem, kimin bu skoru gönderdiğini token'dan anlayarak skorla birlikte kaydeder.

4. Liderlik Tablosu
Ana sayfada her oyun için en yüksek puanları gösteren bir tablo vardır.

Her oyundan en iyi üç skoru gösterir ve kimler yaptıysa isimleriyle birlikte gösterir.

5. Kullanıcıya Özel Skorlar
Giriş yapan bir kullanıcı, sadece kendi oynadığı skorları görebilir.

Bu sayede kullanıcı geçmişteki performansını takip edebilir.


Veritabanı: Tüm kullanıcı bilgileri ve skorlar burada saklanır.

Token sistemi: Her şeyin güvenli bir şekilde çalışmasını sağlar. Giriş yapılmadan hiçbir kritik veriye ulaşılmaz.
