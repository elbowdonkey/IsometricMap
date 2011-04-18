ig.module(
  'plugins.isometric-map'
)
.requires(
  'impact.impact',
  'impact.background-map'
)
.defines(function(){
  ig.IsometricMap = ig.BackgroundMap.extend({
    init: function( tilesize, data, tileset ) {
      this.parent(tilesize, data, tileset);
      this.originalTheta = 30;
      this.originalAlpha = 45;
      this.newTheta = 0;
      this.newAlpha = 0;
      this.setAngles(this.originalTheta,this.originalAlpha);
      this.xFactor = 32;
      this.yFactor = 16;
      this.mouseX = 0;
      this.mouseY = 0;
    },
    setAngles: function(theta,alpha) {
      this.newTheta += theta;
      this.newAlpha += alpha;
      this.theta = this.newTheta * Math.PI/180;
      this.alpha = this.newAlpha * Math.PI/180;
      this.sinTheta = Math.sin(this.theta);
      this.cosTheta = Math.cos(this.theta);
      this.sinAlpha = Math.sin(this.alpha);
      this.cosAlpha = Math.cos(this.alpha);
    },
    toScreen: function(xpp, ypp, zpp) {
      var yp = ypp;
      var xp = xpp * this.cosAlpha + zpp * this.sinAlpha;
      var zp = zpp * this.cosAlpha + xpp * this.sinAlpha;
      var x = xp;
      var y = yp * this.cosTheta - zp * this.sinTheta;
      var z = zp * this.cosTheta + yp * this.sinTheta;
      return [x, y, z];
    },
    toIso: function(screenX, screenY) {
      var z = (screenX / this.cosAlpha - screenY / (this.sinAlpha * this.sinTheta)) * (1 / (this.cosAlpha / this.sinAlpha + this.sinAlpha / this.cosAlpha));
      var x = (1 / this.cosAlpha) * (screenX - z * this.sinAlpha);
      
      return [x, z];
    },
    draw: function() {
      if(!this.tiles.loaded) {
        return;
      }
      var mouseDiffX = this.mouseX - ig.input.mouse.x;
      var mouseDiffY = ig.input.mouse.y - this.mouseY;
      this.mouseX = ig.input.mouse.x;
      this.mouseY = ig.input.mouse.y;
      
      
      if (ig.input.pressed('north'))  this.yFactor -= 0.5;
      if (ig.input.pressed('south'))  this.yFactor += 0.5;
      if (ig.input.pressed('east'))   this.xFactor -= 0.5;
      if (ig.input.pressed('west'))   this.xFactor += 0.5;
      if (ig.input.pressed('a'))      this.setAngles(-1,0);
      if (ig.input.pressed('d'))      this.setAngles(1,0);
      if (ig.input.pressed('w'))      this.setAngles(0,-1);
      if (ig.input.pressed('s'))      this.setAngles(0,1);
      
      if (Math.abs(mouseDiffX) <= 4 && Math.abs(mouseDiffY) <= 4) {
        this.setAngles((mouseDiffX/4), (mouseDiffY/4));
      }
      
      //
      
      this.drawTiled();
      //console.log('stopped');
      //ig.system.stopRunLoop();
    },
    drawTiled: function() {
      var tile = 0,
      anim = null,
      tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
      tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
      pxOffsetX = this.scroll.x % this.tilesize,
      pxOffsetY = this.scroll.y % this.tilesize,
      pxMinX = -pxOffsetX - this.tilesize,
      pxMinY = -pxOffsetY - this.tilesize,
      pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
      pxMaxY = ig.system.height + this.tilesize - pxOffsetY,
      iso_pxX = 0,
      iso_pxY = 0;
      
      for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
        var tileY = mapY + tileOffsetY;
      
        // Repeat Y?
        if( tileY >= this.height || tileY < 0 ) {
          if( !this.repeat ) { continue; }
          tileY = tileY > 0
            ? tileY % this.height
            : ((tileY+1) % this.height) + this.height - 1;
        }
      
        for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize ) {
          var tileX = mapX + tileOffsetX;
      
          // Repeat X?
          if( tileX >= this.width || tileX < 0 ) {
            if( !this.repeat ) { continue; }
            tileX = tileX > 0
              ? tileX % this.width
              : ((tileX+1) % this.width) + this.width - 1;
          }
          // Draw!
          if( (tile = this.data[tileY][tileX]) ) {
              iso_pxX = ((this.tilesize/2)*tileX) - ((this.tilesize/2)*tileY);
              iso_pxY = ((this.tilesize/4)*tileY) + ((this.tilesize/4)*tileX);
              var tmp = this.toScreen(iso_pxX, 0, iso_pxY);
              var tmpIso = this.toIso((tileX*this.xFactor), (tileY*(this.yFactor)));
              //console.log('toScreen:', tmp);
              //console.log('toIso:', tmpIso);
              //console.log('tileX/Y:', tileX*24, tileY*24);
              //console.log('--');
              
              this.tiles.drawTile(iso_pxX+250, iso_pxY, tile-1, this.tilesize );
              //this.tiles.drawTile(tmpIso[0], tmpIso[1]+250, tile-1, this.tilesize, this.tilesize);
          }
        } // end for x
      } // end for y
    }
  });
});