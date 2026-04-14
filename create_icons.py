from PIL import Image, ImageDraw
import os

# Cores
PRETO = (0, 0, 0)
BRANCO = (255, 255, 255)

def create_icon(size):
    img = Image.new('RGBA', (size, size), PRETO)
    draw = ImageDraw.Draw(img)
    
    # Centralizar os elementos
    center = size // 2
    bar_width = size // 8
    handle_width = size // 12
    handle_length = size // 3
    
    # Halteres
    left_x = center - handle_length - bar_width
    right_x = center + handle_width
    
    # Peso esquerdo
    draw.rounded_rectangle([left_x, center - size//6, left_x + bar_width, center + size//6], radius=size//20, fill=BRANCO)
    
    # Barra central
    draw.rounded_rectangle([left_x + bar_width, center - size//20, right_x, center + size//20], radius=size//30, fill=BRANCO)
    
    # Peso direito
    draw.rounded_rectangle([right_x, center - size//6, right_x + bar_width, center + size//6], radius=size//20, fill=BRANCO)
    
    # Texto "FT" no centro
    try:
        draw.text((center, center), "FT", fill=PRETO, anchor="mm")
    except:
        pass
    
    return img

def create_icon_with_text(size):
    img = Image.new('RGBA', (size, size), PRETO)
    draw = ImageDraw.Draw(img)
    
    # Halteres simples
    center = size // 2
    weight_w = size // 6
    weight_h = size // 4
    bar_w = size // 10
    bar_h = size // 20
    
    # Peso esquerdo
    draw.rounded_rectangle([center - size//3 - weight_w//2, center - weight_h//2, center - size//3 + weight_w//2, center + weight_h//2], radius=size//20, fill=BRANCO)
    
    # Barra
    draw.rounded_rectangle([center - size//3 + weight_w//2, center - bar_h//2, center + size//3 - weight_w//2, center + bar_h//2], radius=bar_w//2, fill=BRANCO)
    
    # Peso direito
    draw.rounded_rectangle([center + size//3 - weight_w//2, center - weight_h//2, center + size//3 + weight_w//2, center + weight_h//2], radius=size//20, fill=BRANCO)
    
    # Texto abaixo
    text = "FITTRACK"
    # Usar fallback simples - desenhar linhas
    text_y = center + size//3
    
    return img

# Criar ícones
public_dir = "C:\\Users\\Kamila\\OneDrive\\Desktop\\Claude\\workout-tracker\\public"

# 192x192
icon_192 = create_icon(192)
icon_192.save(os.path.join(public_dir, "icon-192.png"))

# 512x512
icon_512 = create_icon(512)
icon_512.save(os.path.join(public_dir, "icon-512.png"))

print("Ícones criados com sucesso!")