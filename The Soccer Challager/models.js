import {defs, tiny} from './examples/common.js';
import {Body, Simulation, Test_Data} from './examples/collisions-demo.js';
//import { Simulation } from './examples/control-demo.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Triangle, Square, Tetrahedron, Torus, Windmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Rounded_Closed_Cone, Textured_Phong, Capped_Cylinder, Textured_Phong_text, Phong_Shader, Regular_2D_Polygon, Closed_Cone } = defs;
const objs = {}
export {objs}

let cube = new Cube()
let cylinder = new Capped_Cylinder(5, 100)
let tex = new Texture("assets/iron.jpg")
let tex2 = new Texture("assets/human2.png") 
let tex3 = new Texture("assets/white.jpeg")
let cone = new Closed_Cone(100,100)
let sphere = new Subdivision_Sphere(4)
let poly = new Regular_2D_Polygon(100, 100)


const SceneGraph = objs.SceneGraph =
class SceneGraph{
    constructor(geometry = true, name = "", material, model_transform = Mat4.identity()) {
        this.model_transform = model_transform
        this.geometry = geometry 
        this.material = material
        this.name = name
        this.parts = []
        this.initial_center_x = [0,0,0]
        this.center_x = [0,0,0]
        this.w = 0
        this.h = 0
        this.d = 0

        //this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)

     

 }
    addParts(part){ this.parts.push(part)}  //Used to add child parts to the current object.

    draw(context, program_state, transform = Mat4.identity()) {
        var overall_transform = transform.times(this.model_transform)
        if (this.geometry && typeof this.geometry.draw === 'function') {
            this.geometry.draw(context, program_state, overall_transform, this.material)
        } 
        for (let part of this.parts) {  //Keep multiple enabled functions or drawings running.
            part.draw(context, program_state, overall_transform)
        }
    }

    return_pos() {
        return this.center_x  //Returns the current center of the object
    }
    update_bound() {  //Updating the bounding box of an object

        this.bound.x = this.center_x[0]
        this.bound.y = this.center_x[1]
        this.bound.z = this.center_x[2]

        


    }
    change_pos(transform) {
        /* this.initial_center_x[0] = this.model_transform[0][3]
        this.initial_center_x[1] = this.model_transform[1][3]
        this.initial_center_x[2] = this.model_transform[2][3] */
        this.center_x[0] = this.model_transform[0][3]
        this.center_x[1] =this.model_transform[1][3]
        this.center_x[2] =this.model_transform[2][3]
    } 

    update_pos() {
        this.center_x[0] = this.initial_center_x[0] +this.model_transform[0][3]
        this.center_x[1] = this.initial_center_x[1] +this.model_transform[1][3]
        this.center_x[2] = this.initial_center_x[2] +this.model_transform[2][3]
    }
}

const HumanFigure = objs.HumanFigure =
class HumanFigure extends SceneGraph {
constructor(material, model_transform=Mat4.identity()) {
    super(true, "Humanfigure", material, model_transform)

    this.leftArm = new SceneGraph(cube, "LeftArm", material)
    this.rightArm = new SceneGraph(cube, "RightArm", material)
    this.body = new SceneGraph(cube, "Body", material.override({texture: new Texture("assets/human1.png"), color: hex_color("#bae6c2")}))
    this.head = new Head(material)
    this.leftLeg = new SceneGraph(cube, "LeftLeg", material.override({texture: tex2, color: hex_color("#bae6c2")}))
    this.rightLeg = new SceneGraph(cube, "RightLeg", material.override({texture: tex2, color: hex_color("#bae6c2")}))


    this.fb = true
    this.w = 3 * .8 //abs 
    this.h = 7.5 *.8// abs
    this.d = 3 *.8
    this.initial_center_x = [0, 0, 0]
    this.center_x = [0, 0, 0]
    this.change_pos(this.model_transform)
    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
    

    this.head.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.rotation(Math.PI, 1, 0, 0))
    this.leftArm.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0))
                                                    .times(Mat4.translation(1.4, -2.2, 0))
                                                    .times(Mat4.scale(.4, 1, .3))
                                                //.times(Mat4.rotation(Math.PI/4, 0, 0, 1))

    this.rightArm.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(-1.4, -2.2, 0))
                                                    .times(Mat4.scale(.4, 1, .3))
                                                    
    this.body.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(0, -2.5, 0))
                                                    .times(Mat4.scale(1, 1.5, 0.55))
    
    this.leftLeg.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(-0.5, -5, 0))
                                                    .times(Mat4.scale(0.45, 1.5, 0.4))
    this.rightLeg.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(0.5, -5, 0))
                                                    .times(Mat4.scale(0.45, 1.5, 0.4))

    this.initialLeftArmTransform = this.leftArm.model_transform.copy();
    this.initialRightArmTransform = this.rightArm.model_transform.copy();
    this.initialLeftLegTransform = this.leftLeg.model_transform.copy();
    this.initialRightLegTransform = this.rightLeg.model_transform.copy();
    this.initialHead = this.head.model_transform.copy()
    this.initialBody = this.body.model_transform.copy()
  
    this.addParts(this.head)
    this.addParts(this.leftArm)
    this.addParts(this.rightArm)
    this.addParts(this.body)
    this.addParts(this.leftLeg)
    this.addParts(this.rightLeg)

}
update_pos() {
    
    super.update_pos()
}
update() {
    this.leftArm.model_transform = this.initialLeftArmTransform
    this.rightArm.model_transform = this.initialLeftArmTransform
    this.leftLeg.model_transform = this.initialLeftLegTransform
    this.rightLeg.model_transform = this.initialRightArmTransform
    this.head.model_transform = this.initialHead
    this.body.model_transform = this.initialBody

}


update_bound () {
    super.update_bound()
}

draw(context, program_state, transform = Mat4.identity()) {
    

    super.draw(context, program_state, transform, this.material)

   

}

swingArm(time) {

    let angle = Math.sin(2*time) * Math.PI / 6; 

    this.leftArm.model_transform = this.initialLeftArmTransform
        .times(Mat4.scale(1/.4, 1, 1/.3))
        .times(Mat4.translation(1.4, 1, 0))
        .times(Mat4.rotation(angle, 1, 0, 0))
        .times(Mat4.translation(-1.4, -1, 0))
        .times(Mat4.scale(.4, 1, .3))

    this.rightArm.model_transform = this.initialRightArmTransform
        .times(Mat4.scale(1/.4, 1, 1/.3))
        .times(Mat4.translation(-1.4, 1, 0))
        .times(Mat4.rotation(-angle, 1, 0, 0))
        .times(Mat4.translation(1.4, -1, 0))
        .times(Mat4.scale(.4, 1, .3))

}
swingLeg(time) {
    let angle = Math.sin(2* time) * Math.PI / 8; 

    this.leftLeg.model_transform = this.initialLeftLegTransform
        .times(Mat4.scale(1/.45, 1/1.5, 1/.4))
        .times(Mat4.translation(0.5, 2, 0))
        .times(Mat4.rotation(angle, 1, 0, 0))
        .times(Mat4.translation(-0.5, -2, 0))
        .times(Mat4.scale(.45, 1.5, .4))

    this.rightLeg.model_transform = this.initialRightLegTransform
    .times(Mat4.scale(1/.45, 1/1.5, 1/.4))
    .times(Mat4.translation(-0.5, 2, 0))
    .times(Mat4.rotation(-angle, 1, 0, 0))
    .times(Mat4.translation(0.5, -2, 0))
    .times(Mat4.scale(.45, 1.5, .4))


}

swingLeft(time) {
    let angle = -0.3
    //+ Math.abs(Math.sin(1* time) * Math.PI / 8); 

    this.leftLeg.model_transform = this.initialLeftLegTransform
        .times(Mat4.scale(1/.45, 1/1.5, 1/.4))
        .times(Mat4.translation(0.5, 2, 0))
        .times(Mat4.rotation(-angle, 1, 0, 0))
        .times(Mat4.translation(-0.5, -2, 0))
        .times(Mat4.scale(.45, 1.5, .4))
    this.rightLeg.model_transform = this.initialRightLegTransform


}


stop_swin() {
    this.leftArm.model_transform = this.initialLeftArmTransform;
    this.rightArm.model_transform = this.initialRightArmTransform;
    this.leftLeg.model_transform = this.initialLeftLegTransform;
    this.rightLeg.model_transform = this.initialRightLegTransform;

}
}

class Head extends SceneGraph {
constructor(material) {
    super(false, "Head", material); 

    this.main = new SceneGraph(sphere, "Main", material)
    this.leye = new SceneGraph(sphere, "LeftEye", material.override({color: hex_color("#000000")}))
    this.reye = new SceneGraph(sphere, "RightEye", material.override({color: hex_color("#000000")}))

 

    this.transform = Mat4.identity()

    this.basicArrange()
    this.addParts(this.main)
    this.addParts(this.leye)
    this.addParts(this.reye)
}
basicArrange() {
    this.main.model_transform = this.model_transform.times(Mat4.scale(1, 1, 1))
                                                    .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
        
    this.leye.model_transform = this.model_transform.times(Mat4.translation(-0.3, 0.1, 0.8))
                                    .times(Mat4.scale(0.1, 0.2, 0.2));
    this.reye.model_transform = this.model_transform.times(Mat4.translation(0.3, 0.1, 0.8))
                                    .times(Mat4.scale(0.1, 0.2, 0.2)); 
}
draw(context, program_state, transform) {
    // Draw the main part and eyes
    super.draw(context, program_state, transform, this.material)

    
}

}
const soccerNet = objs.soccerNet =
class soccerNet extends SceneGraph {
constructor(material, model_transform=Mat4.identity()) {
    super(false, 'net', material, model_transform)
    // The frame of a soccer goal

    this.rod1 = new SceneGraph(cylinder, "rod1",  material.override({texture: tex})) 
    this.rod2 = new SceneGraph(cylinder, "rod2", material.override({texture: tex}) ) 
    this.rod3 = new SceneGraph(cylinder, "rod3",  material.override({texture: tex})) 
    this.rod4 = new SceneGraph(cylinder, "rod4",  material.override({texture: tex})) 
    this.rod5 = new SceneGraph(cylinder, "rod5",  material.override({texture: tex})) 
    this.rod6 = new SceneGraph(cylinder, "rod6", material.override({texture: tex})) 
    // Two bars for obstacles
    this.rod7 = new SceneGraph(cylinder, "rod7",  material.override({texture: tex})) 
    this.rod8 = new SceneGraph(cylinder, "rod8",  material.override({texture: tex}))
    // Three sides of the net of a soccer goal
    this.face1 = new SceneGraph(cube, "face1", material)
    this.face2 = new SceneGraph(new Triangle(), "face2", material)
    this.face3 = new SceneGraph(new Triangle(), "face3", material)
    this.collision_bound = cube
    this.reference = cube

  

    this.w = 12.6 //abs 
    this.h = 6.6 // abs
    this.d = 7
    this.initial_center_x = [0, 0, 0]
    this.center_x = [0, 0, 0]
    this.change_pos(this.model_transform)
    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
    this.basicArrange()  // Transform the object first
    
    this.addParts(this.rod1)
    this.addParts(this.rod2)
    this.addParts(this.rod3)
    this.addParts(this.rod4)
    this.addParts(this.rod5)
    this.addParts(this.rod6)
    this.addParts(this.rod7)
    this.addParts(this.rod8)
    this.addParts(this.face1)
    this.addParts(this.face2)
    this.addParts(this.face3)
}

basicArrange() {
    //这个rod很诡异，先scale再rotate会变成奇怪的东西
    this.rod1.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                .times(Mat4.scale(0.3, 0.3, 6))
    this.rod2.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                .times(Mat4.scale(0.3, 0.3, 6))
                                .times(Mat4.translation(12 * (1/0.3), 0, 0))

    this.rod3.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.translation(0, -2.8, 3.8))
                                .times(Mat4.scale(0.3, 0.3, 8));

    this.rod4.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.translation(12, -2.8, 3.8))
                                .times(Mat4.scale(0.3, 0.3, 8));

    this.rod5.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.rotation(0.6435, 1, 0, 0))
                                .times(Mat4.scale(0.3, 0.3, 10))
                                .times(Mat4.translation(0, 8, .3));

    this.rod6.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.rotation(0.6435, 1, 0, 0))
                                .times(Mat4.scale(0.3, 0.3, 10))
                                .times(Mat4.translation(12/.3, 8, .3));

    this.rod7.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                .times(Mat4.scale(0.3, 0.3, 12))
                                .times(Mat4.translation(0, 2.8/0.3, .5))

    this.rod8.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                .times(Mat4.scale(0.3, 0.3, 12))
                                .times(Mat4.translation(-7.6/0.3, -2.8/0.3, .5))

    this.face1.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                //.times(Mat4.scale(1, 1, 0.01))
                                //.times(Mat4.translation(1, 0, 0))
                                .times(Mat4.rotation(-0.92729, 1, 0, 0))
                                .times(Mat4.scale(6,4.75,0.01)) 
                                .times(Mat4.translation(1, -.6, 250))


    this.face2.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.scale(1, 6, -8))
                                .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                .times(Mat4.translation(0, -0.5, 0))

    this.face3.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                .times(Mat4.scale(1, 6, -8))
                                .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                .times(Mat4.translation(0, -.5, 12))



}
draw(context, program_state, transform) {
    super.draw(context, program_state, transform, this.material)
    
}
}
const Block1 = objs.Block1 =
class Block1 extends SceneGraph {
constructor(material, model_transform=Mat4.identity()) {
    super(false, "block1", material, model_transform)

    this.model_transform = Mat4.scale(.7, .7, .7)
    this.rod1 = new SceneGraph(cylinder, "rod11",  this.material.override({texture: tex, specularity:.1}))
    this.rod2 = new SceneGraph(cylinder, "rod21",  this.material.override({texture: tex, specularity:.1}))
    this.face1 = new SceneGraph(cube, "face1", this.material.override({texture: tex3, color: hex_color("#a75ed1")}))
    this.face2 = new SceneGraph(cube, "face2", this.material.override({texture: tex3, color: hex_color("#471663")}))

  

    this.w = 10.6 * .7
    //10.6 //abs 
    this.h = 6  * .7// abs
    this.d = .5 * .7
    this.initial_center_x = [0, 0, 0]
    this.center_x = [0, 0, 0]
    this.change_pos(this.model_transform)
    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
    this.basicArrange()
    this.addParts(this.rod1)
    this.addParts(this.rod2)
    this.addParts(this.face1)
    this.addParts(this.face2)

}
basicArrange() {
    this.rod1.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
    .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
    .times(Mat4.scale(0.3,0.3,6))
    this.rod2.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
                                .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                .times(Mat4.scale(0.3,0.3,6))
                                .times(Mat4.translation(10/0.3, 0, 0))
                                //cube default length = 2

    this.face1.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
                                .times(Mat4.rotation(Math.PI/24, 0, 0, 1))
                                .times(Mat4.scale(5/0.99,1,0.01))
                                .times(Mat4.rotation(-Math.PI/128, 0, 0, 1))
                                .times(Mat4.translation(1, 0.3, 0))

    this.face2.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
                                .times(Mat4.rotation(-Math.PI/12, 0, 0, 1))
                                .times(Mat4.scale(5/0.96,0.5,0.01))
                                .times(Mat4.rotation(Math.PI/128, 0, 0, 1))
                                .times(Mat4.translation(1, 3/0.8, -1))
                                                                           

}
draw(context, program_state, transform) {
    super.draw(context, program_state, transform, this.material)
    
}
}

const Chicken = objs.Chicken =
class Chicken extends SceneGraph{
constructor(material, model_transform=Mat4.identity()) {
    super(false, "group", material, model_transform)
    this.first = new Chick(material)
    this.second = new Chick(material)
    this.third = new Chick(material)
    this.w = 10.3//abs 
    this.h = 3.6 // abs
    this.d = 1.8
    this.initial_center_x = [0, 0, 0]
    this.center_x = [0, 0, 0]
    this.change_pos(this.model_transform)
    //console.log(this.center_x)

    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
    this.basicArrange()
    this.addParts(this.first)
    this.addParts(this.second)
    this.addParts(this.third)

}
basicArrange() {
    this.first.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, 0, -4))
    this.second.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, 0, 0))
    this.third.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, 0, 4))
    this.first.initial_model_transform = this.first.model_transform
    this.second.initial_model_transform = this.second.model_transform
    this.third.initial_model_transform = this.third.model_transform

}

//走路的时候扭屁股
 wobble(time, direction = 1) {
    let angle = direction * Math.sin(4*time) * Math.PI /10
    this.first.model_transform = this.first.initial_model_transform .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
                                                                        .times(Mat4.rotation(angle, 0, 1, 0))
                                                                        .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    this.second.model_transform = this.second.initial_model_transform .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
                                                                        .times(Mat4.rotation(angle, 0, 1, 0))
                                                                        .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    this.third.model_transform = this.third.initial_model_transform .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
                                                                        .times(Mat4.rotation(angle, 0, 1, 0))
                                                                        .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    

} 
draw(context, program_state, transform) {
    super.draw(context, program_state, transform, this.material)
}

}

const Chick = objs.Chick =
class Chick extends SceneGraph {
constructor(material, model_transform=Mat4.identity()) {
    super(false, "chick", material, model_transform)
    this.head = new SceneGraph(new Head(material), "head",  material)

    this.body = new SceneGraph(cube, "body", material)
    this.body2= new SceneGraph(cube, "body2", material)
    this.body3 = new SceneGraph(cube, "body3", material)
    this.body4 = new SceneGraph(cube, "body4", material)
    this.body5 = new SceneGraph(cube, "body5", material)
    this.mouse = new SceneGraph(cube, "mouse", material.override({color: hex_color ('#C96303')}))
    this.wing1 =new SceneGraph(cube, "wing1", material.override({color: hex_color('#ebc600')}))
    this.wing2= new SceneGraph(cube, "wing2", material.override({color: hex_color('#ebc600')}))
    this.head_addon =new SceneGraph(cube, "addon", material.override({color: hex_color ('#B90007')}))
    this.head_addon2 =new SceneGraph(cube, "addon", material.override({color: hex_color ('#B90007')}))
    this.leg1 = new SceneGraph(cube, "mouse", material)
    this.leg2= new SceneGraph(cube, "mouse", material)
    this.feet1= new SceneGraph(cube, "mouse", material.override({color: hex_color ('#C96303')}))
    this.feet2= new SceneGraph(cube, "mouse", material.override({color: hex_color ('#C96303')}))

    this.w = 2.4 //abs 
    this.h = 3.6 // abs
    this.d = 4
    this.initial_center_x = [0, 0, 0]
    this.center_x = [0, 0, 0]
    this.change_pos(this.model_transform)

    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)

    this.basicArrange()
    this.addParts(this.head)
    this.addParts(this.body)
    this.addParts(this.body2)
    this.addParts(this.mouse)
    this.addParts(this.body3)
    this.addParts(this.body4)
    this.addParts(this.wing1)
    this.addParts(this.wing2)
    this.addParts(this.leg1)
    this.addParts(this.leg2)
    this.addParts(this.feet1)
    this.addParts(this.feet2)
    this.addParts(this.head_addon)
    this.addParts(this.head_addon2)

}
basicArrange() {
    this.head.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1))     
    this.head_addon.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.rotation(-Math.PI/6, 1, 0, 0))
                                                        .times(Mat4.scale(.1, .3, .1))
                                                        .times(Mat4.translation(0, 1/0.3, .4/.1))
    this.head_addon2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.rotation(Math.PI/6, 1, 0, 0))
                                                        .times(Mat4.scale(.1, .3, .1))
                                                        .times(Mat4.translation(0, 1/0.3, -.3/.1)) 
                                                     
    this.body.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(1, .8, 1))    
                                                .times(Mat4.translation(0, -1.2/.8, -1))
    this.body2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.6, .5, .2))    
                                                .times(Mat4.translation(0, -1.4/.5, 1))
    this.body3.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.7, .8, .3))    
                                                .times(Mat4.translation(0, -1/.8, -2.3/.3))
    this.body4.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.5, .6, .2))    
                                                .times(Mat4.translation(0, -.7/.6, -2.8/.2))
    this.mouse.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.3, .2, .4))    
                                                .times(Mat4.translation(0, -0.8, 1/.4))
                                                
    this.wing1.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .4, .5))    
                                                .times(Mat4.translation(1/.2, -1.2/.4, -1/.5))
    this.wing2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .4, .5))    
                                                .times(Mat4.translation(-1/.2, -1.2/.4, -1/.5))
    this.leg1.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .3, .1))
                                                .times(Mat4.translation(-.5/.2, -2.2/.3, -.7/.1))
    this.leg2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .3, .1))
                                                .times(Mat4.translation(.5/.2, -2.2/.3, -.7/.1))
    this.feet1.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.3, .1, .3))
                                                .times(Mat4.translation(.5/.3, -2.5/.1, -.6/.3))
    this.feet2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.3, .1, .3))
                                                .times(Mat4.translation(-.5/.3, -2.5/.1, -.6/.3))

}
draw(context, program_state, transform) {
    super.draw(context, program_state, transform, this.material)
    
}
}

const Soccer_ball = objs.Soccer_ball =
class Soccer_ball extends SceneGraph {
constructor(material, model_transform = Mat4.identity()) {
    super(false, "soccer_ball", material, model_transform); 

    this.ball = new SceneGraph(sphere, "Ball", material)

    
    this.transform = Mat4.identity()

    this.basicArrange()
    this.addParts(this.ball)
    this.w = .8 //abs 
    this.h = .8 // abs
    this.d = .8
    this.initial_center_x = [0, 0, 0]
    this.center_x = [0, 0, 0]
    this.change_pos(this.model_transform)

    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
    
}
basicArrange() {
    //this.ball.model_transform = this.model_transform.times(Mat4.translation( 0, 0, 17))
                                                   // .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
        
    
}
draw(context, program_state, transform) {
    super.draw(context, program_state, transform, this.material)
}
}


//盒子装的检测区域，需要球体的话可以增加sphere的碰撞检测
const BoundingBox = objs.BoundingBox =
class BoundingBox {
//x, y ,z is the center of the obj
constructor(x, y, z, width, height, depth) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.depth = depth;
}

// only works for +z face
// find_face_normal(other){   
//     let face_p1 = vec3(other.w/2, other.h/2, other.d/2)
//     let face_p2 = vec3(-other.w/2, other.h/2, other.d/2)
//     let face_p3 = vec3(other.w/2, -other.h/2, other.d/2)
//     let face_v1 = face_p2.minus(face_p1)
//     let face_v2 = face_p3.minus(face_p1)
//     console.log(face_v1.cross(face_v2))
//     return face_v1.cross(face_v2)
// }
// 检查与另一个盒子的碰撞
intersects(other) {
    //console.log(Math.abs(this.x + other.x), Math.abs(this.width/2 + other.width/2), Math.abs(this.z + other.z), Math.abs(this.depth/2+ other.depth/2))
    //console.log(other.x, other.z)
    return ((Math.abs(this.x - other.x) <= this.width/2 + other.width/2 &&
    Math.abs(this.z - other.z) <= this.depth/2 + other.depth/2) && Math.abs(this.y - other.y) <= this.height/2 + other.height/2)
}
close(other) {
    return ((Math.abs(this.x - other.x) <= this.width/2 + other.width/2 + .2 &&
    Math.abs(this.z - other.z) <= this.depth/2 + other.depth/2 + .2)) //&& !this.intersects(other))
}
intersects2(other) {
    return((Math.abs(this.y - other.y) <= this.height/2 + other.height/2))
}
}



class Te extends SceneGraph {
constructor(material) {
    super(false, 'te', material)

    this.c = new SceneGraph(cube, 'a', this.material)

    this.addParts(this.c)
    this.w = 2
    this.d = 2
    this.h = 2
    this.c.model_transform - Mat4.identity()
    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
    
}
draw(context, program_state, transform) {
    super.draw(context, program_state, transform, this.material)
    
}
}

const Block2 = objs.Block2 =
class Block2 extends SceneGraph {
constructor(material, model_transform){
    super(false, 'block2', material, model_transform)
    this.main = new SceneGraph(cone, "main", material)
    this.plate = new SceneGraph(new Torus(100, 100), "plate", material) 
    this.basicArrange()
    this.addParts(this.main)
    this.addParts(this.plate)
    this.w = 1.1 //abs 
    this.h = 2 // abs
    this.d = 1.1
    this.initial_center_x = [0, 0, 0]
    this.center_x = [0, 0, 0]
    this.change_pos(this.model_transform)
    this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
    for (let i = 0; i < this.main.geometry.arrays.texture_coord.length; ++i) {
        this.main.geometry.arrays.texture_coord[i].scale_by(1/100)
    } 
}
basicArrange() {
    this.main.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, -1, 0, 0).times(Mat4.scale(1, 1, 1.5))).times(Mat4.translation(0, 0, .5))
    this.plate.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 1, 0, 0).times(Mat4.scale(1.5, 1.5, .3))).times(Mat4.translation(0, 0, .8/.3))
}
draw(context, program_state, transform) {
    super.draw(context, program_state, transform, this.material)
    
}
}

const Flower = objs.Flower =
class Flower extends SceneGraph {
    constructor(material, model_transform = Mat4.identity()) {
        super(false, "flower", material, model_transform); 
        this.color1 = this.get_color()
        this.petal1 = new SceneGraph(poly, "1", material.override({color: this.color1}))
        this.petal2 = new SceneGraph( poly, "1", material.override({color: this.color1}))
        this.petal3 = new SceneGraph( poly, "1", material.override({color: this.color1}))
        this.petal4 = new SceneGraph( poly, "1", material.override({color: this.color1}))
        this.petal5 = new SceneGraph( poly, "1", material.override({color: this.color1})) 
        this.pistel = new SceneGraph(sphere, "2", material)
        this.transform = Mat4.identity()
    
        this.basicArrange()
        this.addParts(this.petal1)
        this.addParts(this.petal2)
        this.addParts(this.petal3)
        this.addParts(this.petal4)
        this.addParts(this.petal5) 
        this.addParts(this.pistel)
    }
    basicArrange() {
        this.petal1.model_transform = Mat4.scale(.3, .3, .3).times(Mat4.rotation(Math.PI/2,1, 0, 0)).times(Mat4.translation(-1.5, 0, 0))
        this.petal2.model_transform = this.petal1.model_transform.times(Mat4.translation(1.5, 0, 0)).times(Mat4.rotation(Math.PI/2.5, 0, 0, 1))
        .times(Mat4.translation(-1.5, 0, 0))
        this.petal3.model_transform = this.petal2.model_transform.times(Mat4.translation(1.5, 0, 0)).times(Mat4.rotation(Math.PI/2.5, 0, 0, 1)).times(Mat4.translation(-1.5, 0, 0))
        this.petal4.model_transform = this.petal3.model_transform.times(Mat4.translation(1.5, 0, 0)).times(Mat4.rotation(Math.PI/2.5, 0, 0, 1)).times(Mat4.translation(-1.5, 0, 0))
        this.petal5.model_transform = this.petal4.model_transform.times(Mat4.translation(1.5, 0, 0)).times(Mat4.rotation(Math.PI/2.5, 0, 0, 1)).times(Mat4.translation(-1.5, 0, 0))
        this.pistel.model_transform = Mat4.scale(.3, .1, .3)
        
            
        
    }
    get_color() {
        return color(Math.random()*(1-0.6)+.6,Math.random()*(1-0.6)+.6,Math.random()*(1-0.6)+.6, 1.0 )
    }
    
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
    }
    }

    const SoccerFieldBoundary = objs.SoccerFieldBoundary =
    class SoccerFieldBoundary extends SceneGraph {
    constructor(material, model_transform = Mat4.identity()) {
            super(false, 'boundary', material, model_transform);
            // 创建边界线的形状
            this.line_1 = new SceneGraph(cube, "Line1", material) 
            this.line_2 = new SceneGraph(cube, "Line2", material) 
            this.line_3 = new SceneGraph(cube, "Line3", material) 
            this.line_4 = new SceneGraph(cube, "Line4", material)
            
            this.basicArrange();
            this.addParts(this.line_1)
            this.addParts(this.line_2)
            this.addParts(this.line_3)
            this.addParts(this.line_4)
            // this.w = 2
            // this.h = 2
            // this.d = 2
            // this.initial_center_x = [0, 0, 0]
            // this.center_x = [0, 0, 0]
            // this.change_pos(this.model_transform)
            // this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        }
        basicArrange() {
             // 场地中心在 (0, 0, 0)，边界宽度和深度为 100 单位
             let field_half_width = 40; // 场地一半的宽度i
             let line_thickness = 0.2;  // 边界线的厚度
            // left boundary
            this.line_1.model_transform = Mat4.identity().times(Mat4.translation(-28,0.1,6)) 
                                                         .times(Mat4.rotation(Math.PI/2,0,1,0))
                                                         .times(Mat4.rotation(Math.PI/2,1,0,0))
                                                         .times(Mat4.scale(32, line_thickness, line_thickness/2));                         
            // right
            this.line_2.model_transform = Mat4.identity().times(Mat4.translation(29,0.1,6)) 
                                                         .times(Mat4.rotation(Math.PI/2,0,1,0))
                                                         .times(Mat4.rotation(Math.PI/2,1,0,0))
                                                         .times(Mat4.scale(32, line_thickness, line_thickness/2));          
            //front
            this.line_3.model_transform = Mat4.identity().times(Mat4.translation(0,0.1,38)) 
                                                         .times(Mat4.rotation(Math.PI/2,1,0,0))
                                                         .times(Mat4.scale(29, line_thickness, line_thickness/2));
           // back
            this.line_4.model_transform = Mat4.identity().times(Mat4.translation(0,.1,-25)) 
                                                         .times(Mat4.rotation(Math.PI/2,1,0,0))
                                                         .times(Mat4.scale(29, line_thickness, line_thickness/2));
            
            // 三个参数分别调整x（左右两边的位置）， y(高度)， z(前后位置)
            //三个参数分别调整长度，厚度，还有知道   一个不         
        }
        // 绘制边界线
        
        draw(context, program_state, transform) {
            // 绘制每条边界线
            super.draw(context, program_state, transform, this.material)
            // this.line_1.draw(context, program_state, transform, this.material);
            // this.line_2.draw(context, program_state, transform, this.material);
            // this.line_3.draw(context, program_state, transform, this.material);
            // this.line_4.draw(context, program_state, transform, this.material);        
        }
    }
    const Arrow = objs.Arrow =
    class Arrow extends SceneGraph{
    constructor(material, model_transform){
        super(false, 'Arrow', material, model_transform)
        this.head = new SceneGraph(new Rounded_Closed_Cone(100, 100), "head", material)
        this.rod = new SceneGraph(cylinder, "rod", material)
        this.basicArrange()
        this.addParts(this.head)
        this.addParts(this.rod)
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)
    }
    basicArrange() {
        this.head.model_transform = Mat4.identity().times(Mat4.scale(0.4,0.4,0.7).times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.translation(0, 0, 0.8)))
        this.rod.model_transform = Mat4.identity().times(Mat4.scale(0.1,0.1,2).times(Mat4.translation(0, 0, 0.5)))
    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
    }
}

const Decorate = objs.Decorate =
    class Decorate extends SceneGraph {
    constructor(material, model_transform) {
        super (false, "Tree", material, model_transform) 
            this.trunk = new SceneGraph(cylinder, "trunk", material.override({color: hex_color("#a0522d")})) 
            this.layer1 = new SceneGraph(cone, "leave", material.override({texture: tex3, color: hex_color("#257029")}))
            this.layer2 =  new SceneGraph(cone, "leave", material.override({texture: tex3,color: hex_color("#257029")}))
            this.layer3 = new SceneGraph(cone, "leave", material.override({texture: tex3,color: hex_color("#49804b")}))
            this.basicArrange()
            this.addParts(this.trunk)
            this.addParts(this.layer1)
            this.addParts(this.layer2)
            this.addParts(this.layer3)
        }
    basicArrange(){
        this.trunk.model_transform = Mat4.rotation(Math.PI/2, 1, 0, 0).times(Mat4.scale(1, 1, 10))
        this.layer1.model_transform = Mat4.rotation(Math.PI/2, -1, 0, 0).times(Mat4.scale(5.5, 5.5, 3)).times(Mat4.translation(0,0, 1.2))
        this.layer2.model_transform = this.layer1.model_transform.times(Mat4.scale(.9, .9, 1)).times(Mat4.translation(0,0, 1.2))
        this.layer3.model_transform = this.layer2.model_transform.times(Mat4.scale(.8, .8, 1)).times(Mat4.translation(0,0, 1.2))
        
    
    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
    }
}