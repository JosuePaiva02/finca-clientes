import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PropertiesService } from '../../../application/properties.service';
import { PropertyEntity } from '../../../domain/model/Property.entity';
import { PropertyImageEntity } from '../../../domain/model/PropertyImage.entity';
import { environment } from '../../../../../environments/environment';
import {HeaderContentComponent} from '../../../../shared/presentation/components/header-content/header-content.component';
import {FooterContentComponent} from '../../../../shared/presentation/components/footer-content/footer-content.component';
import { Tag } from '../../../domain/model/enums/Tag.enum';
import { TagCategory } from '../../../domain/model/enums/TagCategory.enum';
import { TagMetadata } from '../../../domain/model/enums/TagMetadata';
import { CommonModule } from '@angular/common';
import {MatIcon} from '@angular/material/icon'; // Import CommonModule

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, HeaderContentComponent, FooterContentComponent, MatIcon], // Add CommonModule here
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css'
})
export class PropertyDetailComponent implements OnInit {
  title = '';
  imageUrls: string[] = [];
  currentIndex = 0;
  isTransitioning = false;
  isFullscreen = false;
  transitionDirection: 'left' | 'right' | null = null;
  property: PropertyEntity | null = null;
  groupedTags: { category: string; tags: string[] }[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly propertiesService: PropertiesService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.title = '';
      return;
    }

    this.propertiesService.getById(id).subscribe({
      next: (property: PropertyEntity) => {
        this.property = property;
        this.title = property.title ?? '';
        this.imageUrls = this.buildImageUrls(property);
        this.currentIndex = 0;
        this.groupPropertyTags();
        console.log('Property tags:', this.property.tags);
        console.log('Grouped tags:', this.groupedTags);
      },
      error: (err) => {
        console.error('Error fetching property:', err);
        this.property = null;
        this.title = '';
        this.imageUrls = [];
        this.currentIndex = 0;
      }
    });
  }



  get currentImageUrl(): string {
    return this.imageUrls[this.currentIndex] ?? '/assets/HomeArt.webp';
  }

  get sanitizedDescription(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.property?.description ?? '');
  }

  get whatsappLink(): string {
    const propertyUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Hola, quisiera información sobre la siguiente propiedad:\n${propertyUrl}`;
    return `https://wa.me/51923529731?text=${encodeURIComponent(message)}`;
  }





  showPrevious(): void {
    if (this.imageUrls.length === 0) {
      return;
    }

    this.animateTransition('left');
    this.currentIndex = (this.currentIndex - 1 + this.imageUrls.length) % this.imageUrls.length;
  }

  showNext(): void {
    if (this.imageUrls.length === 0) {
      return;
    }

    this.animateTransition('right');
    this.currentIndex = (this.currentIndex + 1) % this.imageUrls.length;
  }

  openFullscreen(): void {
    this.isFullscreen = true;
  }

  closeFullscreen(): void {
    this.isFullscreen = false;
  }

  private animateTransition(direction: 'left' | 'right'): void {
    this.isTransitioning = true;
    this.transitionDirection = direction;
    setTimeout(() => {
      this.isTransitioning = false;
      this.transitionDirection = null;
    }, 320);
  }

  private buildImageUrls(property: PropertyEntity): string[] {
    const images = [...(property.images ?? [])].sort((a: PropertyImageEntity, b: PropertyImageEntity) => {
      if (a.cover && !b.cover) return -1;
      if (!a.cover && b.cover) return 1;
      return a.displayOrder - b.displayOrder;
    });

    if (images.length === 0) {
      return ['/assets/HomeArt.webp'];
    }

    return images.map((image) => this.resolveImageUrl(image.filePath));
  }

  private resolveImageUrl(filePath: string): string {
    const trimmed = filePath?.trim();

    if (!trimmed) {
      return '/assets/HomeArt.webp';
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    const apiUrl = environment.serverBasePath.replace(/\/$/, '');
    const origin = new URL(apiUrl).origin;

    if (trimmed.startsWith('/')) {
      return `${origin}${trimmed}`;
    }

    return `${origin}/${trimmed}`;
  }

  private groupPropertyTags(): void {
    if (!this.property || !this.property.tags) {
      this.groupedTags = [];
      return;
    }

    const tagsByCategory: { [key: string]: string[] } = {};

    for (const tag of this.property.tags) {
      const metadata = TagMetadata[tag];
      if (metadata) {
        const categoryLabel = this.getCategoryLabel(metadata.category);
        if (!tagsByCategory[categoryLabel]) {
          tagsByCategory[categoryLabel] = [];
        }
        tagsByCategory[categoryLabel].push(metadata.label);
      }
    }

    this.groupedTags = Object.keys(tagsByCategory).map(category => ({
      category: category,
      tags: tagsByCategory[category]
    }));
  }

  private getCategoryLabel(category: TagCategory): string {
    switch (category) {
      case TagCategory.MAS_AMBIENTES:
        return 'Más Ambientes';
      case TagCategory.SERVICIOS:
        return 'Servicios';
      case TagCategory.EXTRAS:
        return 'Extras';
      default:
        return 'Otros';
    }
  }
}
