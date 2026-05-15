$products = @(
    @{id = 1; url = 'https://th.bing.com/th/id/OIP._rX8JH2uhmGZIg9NSNcM2QHaGI?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 2; url = 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800' },
    @{id = 3; url = 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800' },
    @{id = 4; url = 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=800' },
    @{id = 5; url = 'https://th.bing.com/th/id/OIP.14T5a1ZZQasmZdgYZScWowHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 6; url = 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800' },
    @{id = 7; url = 'https://tse3.mm.bing.net/th/id/OIP.tUuLUGdehZZXjfSZpKPHLAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 8; url = 'https://www.map24.com/wp-content/uploads/2023/02/6156tIZclL.jpg' },
    @{id = 9; url = 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
    @{id = 10; url = 'https://forest-master.com/wp-content/uploads/2023/10/1.png' },
    @{id = 11; url = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800' },
    @{id = 12; url = 'https://tse2.mm.bing.net/th/id/OIP.txCSM0RSDLi3YS3-1xhgBgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 13; url = 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
    @{id = 14; url = 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800' },
    @{id = 15; url = 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
    @{id = 16; url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800' },
    @{id = 17; url = 'https://tse2.mm.bing.net/th/id/OIP.xBdAZAqcG6BLPEPwNdnZIAHaHA?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 18; url = 'https://tse3.mm.bing.net/th/id/OIP.-dmbbqbqRzKIGsy8V9BVFAHaFJ?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 19; url = 'https://tse4.mm.bing.net/th/id/OIP.ERAj0TK6Y8aPJMChY_SxvQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 20; url = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800' },
    @{id = 21; url = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800' },
    @{id = 22; url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800' },
    @{id = 23; url = 'https://m.media-amazon.com/images/I/61xZ5pAeaAL.jpg' },
    @{id = 24; url = 'https://tse4.mm.bing.net/th/id/OIP.QrF-9KX1ANVGeDqfE_pohQHaHm?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 25; url = 'https://tse2.mm.bing.net/th/id/OIP.Wrvg9s4WcyaiOObZ_0dQyAHaHe?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 26; url = 'https://tse3.mm.bing.net/th/id/OIP.fBSsILH5Y7hPDlpgvtd4dQHaGR?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 27; url = 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800' },
    @{id = 28; url = 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800' },
    @{id = 29; url = 'https://tse3.mm.bing.net/th/id/OIP.cQL2xDLkuHoam5YknO2qegHaIJ?rs=1&pid=ImgDetMain&o=7&rm=3' },
    @{id = 30; url = 'https://www.powerenergy.gr/wp-content/uploads/2024/07/811YIHVKKaL.jpg' }
)

$targetDir = "e:\My 2nd Sem Project\NeuroEcom.BI\NeuroEcom.BI\backend\wwwroot\images\products"
if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Force -Path $targetDir }

foreach ($p in $products) {
    $ext = "jpg"
    if ($p.url -like "*.png*") { $ext = "png" }
    $fileName = "product_$($p.id).$ext"
    $dest = Join-Path $targetDir $fileName
    Write-Host "Downloading $($p.url) to $dest"
    try {
        Invoke-WebRequest -Uri $p.url -OutFile $dest -TimeoutSec 30
        
        # Update SQL
        $localUrl = "/images/products/$fileName"
        $sql = "UPDATE Products SET ImageUrl = '$localUrl' WHERE Id = $($p.id)"
        Write-Host "Executing SQL: $sql"
        sqlcmd -S DESKTOP-OSBH8T2\SQLEXPRESS -d NeuroEcomBI -C -Q $sql
    }
    catch {
        Write-Error "Failed to download $($p.url)"
    }
}
